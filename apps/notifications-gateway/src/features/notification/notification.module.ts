import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationGateway } from './gateway/notification.gateway';
import { NotificationStorageService } from './notification-storage.service';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [NotificationGateway, NotificationStorageService],
  exports: [NotificationGateway, NotificationStorageService],
})
export class NotificationModule {}
