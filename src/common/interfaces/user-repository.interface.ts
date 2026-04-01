import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { GetUsersQueryDto } from 'src/features/users/dto/get-users-query-dto';
import { UpdateUserDto } from 'src/features/users/dto/update-user-dto';
import { User } from 'src/features/users/entity/user.entity';

export abstract class IUserRepository {
  abstract findMany(params: GetUsersQueryDto): Promise<[User[], number]>;
  abstract findById(userId: number): Promise<User | null>;
  abstract findByLogin(login: string): Promise<User | null>;
  abstract create(createUserDto: CreateUserDto): Promise<User>;
  abstract update(id: number, createUserDto: UpdateUserDto): Promise<User>;
  abstract softDeleteById(id: number): Promise<void>;
}
