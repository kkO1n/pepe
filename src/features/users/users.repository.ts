import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { BaseRepository } from '../base.repository';
import { IUserRepository } from 'src/common/interfaces/user-repository.interface';
import { CreateUserDto } from './dto/create-user-dto';
import { DATA_SOURCE } from 'src/common/constants';

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    super(dataSource);
  }

  private userRepository(entityManager?: EntityManager): Repository<User> {
    return this.getRepository(User, entityManager);
  }

  async findUsers(): Promise<[User[], number]> {
    return this.userRepository().findAndCount();
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

  async createUser(userDto: CreateUserDto): Promise<User> {
    return this.userRepository().save(userDto);
  }
}
