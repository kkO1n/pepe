import { Body, Controller, Param, Post } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationGateway } from './features/notification/gateway/notification.gateway';

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
  constructor(private readonly notificationGateway: NotificationGateway) {}

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
  handleTransferCompleted(event: TransferCompletedEvent) {
    const { authId, amount } = event;
    this.notificationGateway.sendNotification(
      String(authId),
      `Transfer completed: ${amount}`,
    );
  }
}
