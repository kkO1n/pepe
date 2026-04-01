import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { GetUsersQueryDto } from 'src/features/users/dto/get-users-query-dto';
import { UpdateUserDto } from 'src/features/users/dto/update-user-dto';
import { User } from 'src/features/users/entity/user.entity';

export abstract class IUserRepository {
  abstract findUsers(params: GetUsersQueryDto): Promise<[User[], number]>;
  abstract findUserById(userId: number): Promise<User | null>;
  abstract findUserByLogin(login: string): Promise<User | null>;
  abstract createUser(createUserDto: CreateUserDto): Promise<User>;
  abstract putUser(id: number, createUserDto: UpdateUserDto): Promise<User>;
  abstract deleteUser(id: number): Promise<void>;
}
