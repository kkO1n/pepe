import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/common/interfaces/user-repository.interface';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findUsers() {
    return this.userRepository.findUsers();
  }

  async findOneById(userId: number) {
    return this.userRepository.findUserById(userId);
  }

  async findOneByLogin(login: string) {
    return this.userRepository.findUserByLogin(login);
  }

  async createOne(createUserDto: CreateUserDto) {
    return this.userRepository.createUser(createUserDto);
  }
}
