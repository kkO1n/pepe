import {
  TRANSFER_COMPLETED_TOPIC,
  type TransferCompletedEventV1,
} from '@contracts/index';
import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  NotificationGateway,
  type NotificationPayload,
} from './features/notification/gateway/notification.gateway';
import { NotificationStorageService } from './features/notification/notification-storage.service';
import { MetricsService } from './observability/metrics.service';

type SendNotificationBody = {
  data?: string;
};

@Controller()
export class NotificationsGatewayController {
  private readonly logger = new Logger(NotificationsGatewayController.name);

  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationStorageService: NotificationStorageService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post('notification/:userId')
  sendNotification(
    @Param('userId') userId: string,
    @Body() body: SendNotificationBody,
  ) {
    const payload: NotificationPayload = {
      type: 'message',
      message: body?.data ?? 'hello!',
    };

    this.notificationGateway.sendNotification(userId, payload);
    this.metricsService.observeNotification('http', payload.type);

    return {
      ok: true,
    };
  }

  @EventPattern(TRANSFER_COMPLETED_TOPIC)
  async handleTransferCompleted(event: TransferCompletedEventV1) {
    const { authId, recipientId, amount } = event.payload;
    const payload: NotificationPayload = {
      type: 'transfer_completed',
      amount,
      senderId: authId,
      recipientId,
      transferredAt: new Date().toISOString(),
      message: `Transfer completed: ${amount}`,
    };

    this.notificationGateway.sendNotification(String(recipientId), payload);
    this.metricsService.observeNotification('kafka', payload.type);

    try {
      await this.notificationStorageService.saveTransferNotification(
        event.payload,
      );
      this.logger.log(
        `Notification persisted for transfer authId=${authId} -> recipientId=${recipientId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to persist notification authId=${authId} -> recipientId=${recipientId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
