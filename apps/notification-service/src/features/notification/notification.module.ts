import { Module } from '@nestjs/common';
import { NotificationGateway } from './gateway/notification.gateway';

@Module({
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
