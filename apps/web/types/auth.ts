export type AuthUser = {
  id: number;
  login: string;
  email: string;
  age: number;
  description: string;
  balance: string;
};

export type LoginPayload = {
  login: string;
  password: string;
};

export type RegisterPayload = {
  login: string;
  email: string;
  password: string;
  age: number;
  description: string;
};
