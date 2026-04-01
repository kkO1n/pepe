import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { PutUserDto } from 'src/features/users/dto/put-user-dto';
import { User } from 'src/features/users/entity/user.entity';

export type PaginatedUsersQueryParams = {
  page: number;
  limit: number;
  login?: string;
};

export abstract class IUserRepository {
  abstract findUsers(
    params: PaginatedUsersQueryParams,
  ): Promise<[User[], number]>;
  abstract findUserById(userId: number): Promise<User | null>;
  abstract findUserByLogin(login: string): Promise<User | null>;
  abstract createUser(createUserDto: CreateUserDto): Promise<User>;
  abstract putUser(id: number, createUserDto: PutUserDto): Promise<User>;
  abstract deleteUser(id: number): void;
}
