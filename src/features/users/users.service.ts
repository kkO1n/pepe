import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DATA_SOURCE } from 'src/common/constants';
import { IUserRepository } from 'src/common/interfaces/user-repository.interface';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { DataSource } from 'typeorm';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import {
  PaginatedUsersResponseDto,
  UserResponseDto,
} from './dto/user-response-dto';
import { Users } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly userRepository: IUserRepository,
  ) {}

  async resetAllBalances() {
    return this.userRepository.resetBalances();
  }

  async transfer(
    authId: number,
    recipientId: number,
    amount: string,
  ): Promise<void> {
    if (authId === recipientId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Users);

      const [minId, maxId] =
        authId < recipientId ? [authId, recipientId] : [recipientId, authId];

      const lockedUsers = await this.userRepository.lockUsers(
        repo,
        minId,
        maxId,
      );

      if (lockedUsers.length !== 2) {
        throw new NotFoundException('Sender or recipient not found');
      }

      const debit = await this.userRepository.debit(repo, authId, parsedAmount);

      if ((debit.affected ?? 0) !== 1) {
        throw new ConflictException('Insufficient funds');
      }

      const credit = await this.userRepository.credit(
        repo,
        recipientId,
        parsedAmount,
      );

      if ((credit.affected ?? 0) !== 1) {
        throw new NotFoundException('Recipient not found');
      }
    });
  }

  async listUsers(
    params: GetUsersQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    const [data, total] = await this.userRepository.findManyByLogin(params);

    return plainToInstance(
      PaginatedUsersResponseDto,
      { data, total },
      { excludeExtraneousValues: true },
    );
  }

  async listActiveUsers(minAge: number, maxAge: number) {
    return await this.userRepository.findManyByActivity(minAge, maxAge);
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
