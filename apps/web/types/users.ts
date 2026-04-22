import type { AuthUser } from './auth';

export type UsersListResponse = {
  data: AuthUser[];
  total: number;
};

export type TransferPayload = {
  recipientId: number;
  amount: string;
};
