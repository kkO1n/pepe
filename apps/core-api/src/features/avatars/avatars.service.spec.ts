import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { IAvatarsRepository } from '@core-api/common/interfaces/avatars-repository.interface';
import { FILE_SERVICE } from '@core-api/providers/files/files.adapter';
import { AvatarsService } from './avatars.service';

describe('AvatarsService', () => {
  let service: AvatarsService;
  const avatarsRepository = {
    create: jest.fn(),
    getAvatarsByUserId: jest.fn(),
    getAvatarsListByUserId: jest.fn(),
    getAvatarMetaById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarsService,
        {
          provide: FILE_SERVICE,
          useValue: { uploadFile: jest.fn(), removeFile: jest.fn() },
        },
        { provide: IAvatarsRepository, useValue: avatarsRepository },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'S3_PUBLIC_BASE_URL') {
                return 'http://127.0.0.1:9000/dabucket';
              }
              return undefined;
            }),
            getOrThrow: jest.fn((key: string) => {
              if (key === 'S3_BUCKET_NAME') return 'dabucket';
              if (key === 'S3_ENDPOINT') return 'http://127.0.0.1:9000';
              throw new Error(`Unexpected key: ${key}`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AvatarsService>(AvatarsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('listMyAvatars returns repository list with public urls', async () => {
    avatarsRepository.getAvatarsListByUserId.mockResolvedValueOnce([
      {
        avatarId: 10,
        path: 'some/path.png',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        isPrimary: false,
      },
    ]);

    const result = await service.listMyAvatars(77);

    expect(avatarsRepository.getAvatarsListByUserId).toHaveBeenCalledWith(77);
    expect(result).toEqual([
      {
        avatarId: 10,
        path: 'http://127.0.0.1:9000/dabucket/some/path.png',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        isPrimary: false,
      },
    ]);
  });
});
