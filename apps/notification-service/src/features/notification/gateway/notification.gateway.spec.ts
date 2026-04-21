import type { TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
