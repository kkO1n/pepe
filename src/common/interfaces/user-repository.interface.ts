import type {
  ActiveUserListItem,
  ActiveUsersQueryParams,
  CreateUserPayload,
  ListUsersParams,
  UpdateUserPayload,
} from 'src/features/users/types/user-repository.types';
import type { Users } from 'src/features/users/entity/user.entity';
import type { UpdateResult } from 'typeorm';

export abstract class IUserRepository {
  abstract findManyByActivity(
    params: ActiveUsersQueryParams,
  ): Promise<[ActiveUserListItem[], number]>;
  abstract findManyByLogin(params: ListUsersParams): Promise<[Users[], number]>;
  abstract findById(userId: number): Promise<Users | null>;
  abstract findByLogin(login: string): Promise<Users | null>;
  abstract create(createUserDto: CreateUserPayload): Promise<Users>;
  abstract update(id: number, createUserDto: UpdateUserPayload): Promise<Users>;
  abstract softDeleteById(id: number): Promise<void>;

  abstract lockUsers(minId: number, maxId: number): Promise<Users[]>;
  abstract debit(authId: number, amount: number): Promise<UpdateResult>;
  abstract credit(recipientId: number, amount: number): Promise<UpdateResult>;
  abstract resetBalances(): Promise<void>;
}
