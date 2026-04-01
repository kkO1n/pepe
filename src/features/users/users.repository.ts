import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { BaseRepository } from '../base.repository';
import {
  IUserRepository,
  PaginatedUsersQueryParams,
} from 'src/common/interfaces/user-repository.interface';
import { CreateUserDto } from './dto/create-user-dto';
import { DATA_SOURCE } from 'src/common/constants';
import { PutUserDto } from './dto/put-user-dto';

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
  }: PaginatedUsersQueryParams): Promise<[User[], number]> {
    return this.userRepository().findAndCount({
      where: login ? { login: ILike(`%${login}%`) } : {},
      take: limit,
      skip: (page - 1) * limit,
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

  async putUser(id: number, putUserDto: PutUserDto): Promise<User> {
    return this.userRepository().save({
      id,
      ...putUserDto,
    });
  }

  async deleteUser(id: number) {
    return await this.userRepository().softDelete(id);
  }
}
