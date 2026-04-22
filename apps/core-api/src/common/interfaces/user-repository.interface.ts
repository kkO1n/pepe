import type {
  ActiveUserListItem,
  ActiveUsersQueryParams,
  CreateUserPayload,
  ListUsersParams,
  UpdateUserPayload,
} from '@core-api/features/users/types/user-repository.types';
import type { User } from '@core-api/features/users/entity/user.entity';
import type { UpdateResult } from 'typeorm';

export abstract class IUserRepository {
  abstract findManyByActivity(
    params: ActiveUsersQueryParams,
  ): Promise<[ActiveUserListItem[], number]>;
  abstract findManyByLogin(params: ListUsersParams): Promise<[User[], number]>;
  abstract findById(userId: number): Promise<User | null>;
  abstract findByLogin(login: string): Promise<User | null>;
  abstract create(createUserDto: CreateUserPayload): Promise<User>;
  abstract update(id: number, createUserDto: UpdateUserPayload): Promise<User>;
  abstract softDeleteById(id: number): Promise<void>;

  abstract lockUsers(minId: number, maxId: number): Promise<User[]>;
  abstract debit(authId: number, amount: number): Promise<UpdateResult>;
  abstract credit(recipientId: number, amount: number): Promise<UpdateResult>;
  abstract resetBalances(): Promise<void>;
}
