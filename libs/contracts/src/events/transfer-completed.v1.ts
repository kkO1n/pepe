import { randomUUID } from 'node:crypto';
import { TRANSFER_COMPLETED_TOPIC } from '../topics';

export type TransferCompletedPayloadV1 = {
  authId: number;
  recipientId: number;
  amount: number;
};

export type TransferCompletedEventV1 = {
  eventId: string;
  eventType: typeof TRANSFER_COMPLETED_TOPIC;
  eventVersion: 1;
  occurredAt: string;
  payload: TransferCompletedPayloadV1;
};

export function createTransferCompletedEventV1(
  payload: TransferCompletedPayloadV1,
): TransferCompletedEventV1 {
  return {
    eventId: randomUUID(),
    eventType: TRANSFER_COMPLETED_TOPIC,
    eventVersion: 1,
    occurredAt: new Date().toISOString(),
    payload,
  };
}
