import { Injectable } from '@nestjs/common';
import {
  IUserRepository,
  PaginatedUsersQueryParams,
} from 'src/common/interfaces/user-repository.interface';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { PutUserDto } from './dto/put-user-dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findUsers(params: PaginatedUsersQueryParams) {
    return this.userRepository.findUsers(params);
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

  async putOne(id: number, putUserDto: PutUserDto) {
    return this.userRepository.putUser(id, putUserDto);
  }

  deleteOne(id: number) {
    return this.userRepository.deleteUser(id);
  }
}
