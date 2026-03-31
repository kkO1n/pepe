import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/common/constants';
import { User } from 'src/features/users/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(login: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        login,
      },
    });
  }

  createOne(user: CreateUserDto): Promise<User> {
    return this.userRepository.save(user);
  }
}
