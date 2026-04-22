import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '@pepe/auth/auth.guard';
import { AvatarsController } from './avatars.controller';
import { AvatarsService } from './avatars.service';

describe('AvatarsController', () => {
  let controller: AvatarsController;
  const avatarsService = {
    listMyAvatars: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarsController],
      providers: [
        {
          provide: AvatarsService,
          useValue: avatarsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AvatarsController>(AvatarsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getMyAvatars delegates to service', async () => {
    avatarsService.listMyAvatars.mockResolvedValueOnce([]);

    await controller.getMyAvatars(5);

    expect(avatarsService.listMyAvatars).toHaveBeenCalledWith(5);
  });
});
