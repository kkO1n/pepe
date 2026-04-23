import {
  createTransferCompletedEventV1,
  TRANSFER_COMPLETED_TOPIC,
} from '@contracts/index';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  INotificationEventsPort,
  TransferCompletedPayload,
} from '@core-api/common/interfaces/notification-events-port.interface';

@Injectable()
export class KafkaNotificationEventsAdapter implements INotificationEventsPort {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientKafka,
  ) {}

  publishTransferCompleted(payload: TransferCompletedPayload): void {
    this.client.emit(
      TRANSFER_COMPLETED_TOPIC,
      createTransferCompletedEventV1(payload),
    );
  }
}
