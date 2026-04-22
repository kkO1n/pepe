import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotificationGateway } from './features/notification/gateway/notification.gateway';
import { NotificationStorageService } from './features/notification/notification-storage.service';
import { NotificationServiceController } from './notification-service.controller';

describe('NotificationServiceController', () => {
  let notificationServiceController: NotificationServiceController;
  let notificationGateway: { sendNotification: jest.Mock };
  let notificationStorageService: { saveTransferNotification: jest.Mock };

  beforeEach(async () => {
    notificationGateway = {
      sendNotification: jest.fn(),
    };
    notificationStorageService = {
      saveTransferNotification: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
      providers: [
        {
          provide: NotificationGateway,
          useValue: notificationGateway,
        },
        {
          provide: NotificationStorageService,
          useValue: notificationStorageService,
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

  it('emits structured transfer notification payload', async () => {
    await notificationServiceController.handleTransferCompleted({
      authId: 5,
      recipientId: 8,
      amount: 12.34,
    });

    expect(notificationGateway.sendNotification).toHaveBeenCalledWith(
      '8',
      expect.objectContaining({
        type: 'transfer_completed',
        amount: 12.34,
        senderId: 5,
        recipientId: 8,
        message: 'Transfer completed: 12.34',
      }),
    );
    expect(
      notificationStorageService.saveTransferNotification,
    ).toHaveBeenCalled();
  });
});
