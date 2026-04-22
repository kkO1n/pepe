import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

type TransferCompletedEvent = {
  authId: number;
  recipientId: number;
  amount: number;
};

@Injectable()
export class NotificationStorageService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async saveTransferNotification(event: TransferCompletedEvent): Promise<void> {
    await this.notificationModel.create({
      senderId: event.authId,
      recipientId: event.recipientId,
      amount: event.amount,
      transferredAt: new Date(),
    });
  }
}
