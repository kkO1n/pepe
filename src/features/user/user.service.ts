import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/common/constants';
import { User } from 'src/features/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
