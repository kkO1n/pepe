import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  FILE_SERVICE,
  type IFileService,
} from 'src/providers/files/files.adapter';
import { AvatarsService } from './avatars.service';

describe('AvatarsService', () => {
  let service: AvatarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarsService,
        {
          provide: FILE_SERVICE,
          useValue: {} as IFileService,
        },
      ],
    }).compile();

    service = module.get<AvatarsService>(AvatarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
