import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { BaseRepository } from '../base.repository';
import { IUserRepository } from 'src/common/interfaces/user-repository.interface';
import { CreateUserDto } from './dto/create-user-dto';
import { DATA_SOURCE } from 'src/common/constants';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    super(dataSource);
  }

  private userRepository(entityManager?: EntityManager): Repository<User> {
    return this.getRepository(User, entityManager);
  }

  async findUsers({
    page,
    limit,
    login,
  }: GetUsersQueryDto): Promise<[User[], number]> {
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;
    const trimmedLogin = login?.trim();

    return this.userRepository().findAndCount({
      where: trimmedLogin ? { login: ILike(`%${trimmedLogin}%`) } : {},
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      order: { id: 'ASC' },
    });
  }

  async findUserById(postId: number): Promise<User | null> {
    return this.userRepository().findOne({
      where: { id: postId },
    });
  }

  async findUserByLogin(login: string): Promise<User | null> {
    return this.userRepository().findOne({
      where: { login },
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository().save(createUserDto);
  }

  async putUser(id: number, putUserDto: UpdateUserDto): Promise<User> {
    return this.userRepository().save({
      id,
      ...putUserDto,
    });
  }

  async deleteUser(id: number) {
    await this.userRepository().softDelete(id);
  }
}
