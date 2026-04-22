import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotificationGateway } from './features/notification/gateway/notification.gateway';
import { NotificationStorageService } from './features/notification/notification-storage.service';
import { NotificationServiceController } from './notification-service.controller';

describe('NotificationServiceController', () => {
  let notificationServiceController: NotificationServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
      providers: [
        {
          provide: NotificationGateway,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: NotificationStorageService,
          useValue: {
            saveTransferNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    notificationServiceController = app.get<NotificationServiceController>(
      NotificationServiceController,
    );
  });

  it('should be defined', () => {
    expect(notificationServiceController).toBeDefined();
  });
});
