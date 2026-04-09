export interface ListUsersParams {
  page?: number;
  limit?: number;
  login?: string;
}

export interface ActiveUsersQueryParams {
  minAge: number;
  maxAge: number;
}

export interface ActiveUserListItem {
  id: number;
  login: string;
  email: string;
  age: number;
  balance: string;
  description: string;
  latestAvatarPath: string | null;
}

export interface CreateUserPayload {
  login: string;
  email: string;
  password: string;
  age: number;
  description: string;
}

export interface UpdateUserPayload {
  login?: string;
  email?: string;
  password?: string;
  age?: number;
  description?: string;
}
