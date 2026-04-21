import { Body, Controller, Param, Post } from '@nestjs/common';
import { NotificationGateway } from './features/notification/gateway/notification.gateway';

type SendNotificationBody = {
  data?: string;
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
}
