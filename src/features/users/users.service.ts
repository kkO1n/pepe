import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/common/interfaces/user-repository.interface';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findUsers(params: GetUsersQueryDto) {
    const [data, total] = await this.userRepository.findUsers(params);

    return {
      data,
      total,
    };
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

  async putOne(id: number, putUserDto: UpdateUserDto) {
    return this.userRepository.putUser(id, putUserDto);
  }

  deleteOne(id: number) {
    return this.userRepository.deleteUser(id);
  }
}
