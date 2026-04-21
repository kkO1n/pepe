import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { IAvatarsRepository } from '@pepe/common/interfaces/avatars-repository.interface';
import { FILE_SERVICE } from '@pepe/providers/files/files.adapter';
import { AvatarsService } from './avatars.service';

describe('AvatarsService', () => {
  let service: AvatarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarsService,
        {
          provide: FILE_SERVICE,
          useValue: { uploadFile: jest.fn(), removeFile: jest.fn() },
        },
        { provide: IAvatarsRepository, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<AvatarsService>(AvatarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
