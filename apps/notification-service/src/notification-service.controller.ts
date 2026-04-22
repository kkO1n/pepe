import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationGateway } from './features/notification/gateway/notification.gateway';
import { NotificationStorageService } from './features/notification/notification-storage.service';

type SendNotificationBody = {
  data?: string;
};

type TransferCompletedEvent = {
  authId: number;
  recipientId: number;
  amount: number;
};

@Controller()
export class NotificationServiceController {
  private readonly logger = new Logger(NotificationServiceController.name);

  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationStorageService: NotificationStorageService,
  ) {}

  @Post('notification/:userId')
  sendNotification(
    @Param('userId') userId: string,
    @Body() body: SendNotificationBody,
  ) {
    this.notificationGateway.sendNotification(userId, body?.data);

    return {
      ok: true,
    };
  }

  @EventPattern('transfer_completed')
  async handleTransferCompleted(event: TransferCompletedEvent) {
    const { recipientId, amount } = event;

    this.notificationGateway.sendNotification(
      String(recipientId),
      `Transfer completed: ${amount}`,
    );

    try {
      await this.notificationStorageService.saveTransferNotification(event);
      this.logger.log(
        `Notification persisted for transfer authId=${event.authId} -> recipientId=${recipientId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to persist notification authId=${event.authId} -> recipientId=${recipientId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
