import type { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import type { GetUsersQueryDto } from 'src/features/users/dto/get-users-query-dto';
import type { UpdateUserDto } from 'src/features/users/dto/update-user-dto';
import type { Users } from 'src/features/users/entity/user.entity';

export abstract class IUserRepository {
  abstract findManyByActivity(
    minAge: number,
    maxAge: number,
  ): Promise<[Users[], number]>;
  abstract findManyByLogin(
    params: GetUsersQueryDto,
  ): Promise<[Users[], number]>;
  abstract findById(userId: number): Promise<Users | null>;
  abstract findByLogin(login: string): Promise<Users | null>;
  abstract create(createUserDto: CreateUserDto): Promise<Users>;
  abstract update(id: number, createUserDto: UpdateUserDto): Promise<Users>;
  abstract softDeleteById(id: number): Promise<void>;
}
