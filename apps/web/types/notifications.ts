export type NotificationPayload = {
  type: 'transfer_completed' | 'message';
  message: string;
  amount?: number;
  senderId?: number;
  recipientId?: number;
  transferredAt?: string;
};
