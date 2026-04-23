import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { TransferCompletedPayloadV1 } from '@contracts/index';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationStorageService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async saveTransferNotification(
    event: TransferCompletedPayloadV1,
  ): Promise<void> {
    await this.notificationModel.create({
      senderId: event.authId,
      recipientId: event.recipientId,
      amount: event.amount,
      transferredAt: new Date(),
    });
  }
}
