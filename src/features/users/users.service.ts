import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/common/interfaces/user-repository.interface';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import {
  PaginatedUsersResponseDto,
  UserResponseDto,
} from './dto/user-response-dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  async listUsers(
    params: GetUsersQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    const [data, total] = await this.userRepository.findMany(params);

    return plainToInstance(
      PaginatedUsersResponseDto,
      { data, total },
      { excludeExtraneousValues: true },
    );
  }

  async getUserById(userId: number) {
    return this.userRepository.findById(userId);
  }

  async getAuthUserByLogin(login: string) {
    return this.userRepository.findByLogin(login);
  }

  async getPublicUserByLogin(login: string) {
    const user = await this.userRepository.findByLogin(login);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    return this.userRepository.create(createUserDto);
  }

  async updateUser(id: number, putUserDto: UpdateUserDto) {
    const user = await this.userRepository.update(id, putUserDto);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  deleteUser(id: number) {
    return this.userRepository.softDeleteById(id);
  }
}
