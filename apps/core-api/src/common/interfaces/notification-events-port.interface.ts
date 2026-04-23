export type TransferCompletedPayload = {
  authId: number;
  recipientId: number;
  amount: number;
};

export abstract class INotificationEventsPort {
  abstract publishTransferCompleted(payload: TransferCompletedPayload): void;
}
