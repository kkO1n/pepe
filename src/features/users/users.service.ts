import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/common/constants';
import { User } from 'src/features/users/entity/user.entity';
import { Repository } from 'typeorm';

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
}
