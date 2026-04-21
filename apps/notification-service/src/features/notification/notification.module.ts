import { Module } from '@nestjs/common';
import { NotificationGateway } from './gateway/notification.gateway';

@Module({
  providers: [NotificationGateway],
})
export class NotificationModule {}
