import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { IUserRepository } from '@pepe/common/interfaces/user-repository.interface';
import { ActiveUsersQueryDto } from '@pepe/features/users/dto/active-users-query-dto';
import { CreateUserDto } from '@pepe/features/users/dto/create-user-dto';
import { plainToInstance } from 'class-transformer';
import { Transactional } from 'typeorm-transactional';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import {
  PaginatedUsersResponseDto,
  UserResponseDto,
} from './dto/user-response-dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientKafka,
    private readonly userRepository: IUserRepository,
  ) {}

  async resetAllBalances() {
    return this.userRepository.resetBalances();
  }

  @Transactional()
  async transfer(
    authId: number,
    recipientId: number,
    amount: string,
  ): Promise<void> {
    const transferMeta = `senderId=${authId}, recipientId=${recipientId}, amount=${amount}`;
    this.logger.log(`Transfer started | ${transferMeta}`);

    if (authId === recipientId) {
      this.logger.warn(
        `Transfer rejected: same sender/recipient | ${transferMeta}`,
      );
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      this.logger.warn(`Transfer rejected: invalid amount | ${transferMeta}`);
      throw new BadRequestException('Amount must be positive');
    }
    this.logger.debug(`Transfer amount validated | ${transferMeta}`);

    try {
      const [minId, maxId] =
        authId < recipientId ? [authId, recipientId] : [recipientId, authId];

      const lockedUsers = await this.userRepository.lockUsers(minId, maxId);

      if (lockedUsers.length !== 2) {
        this.logger.warn(
          `Transfer rejected: users not found | ${transferMeta}`,
        );
        throw new NotFoundException('Sender or recipient not found');
      }

      const debit = await this.userRepository.debit(authId, parsedAmount);

      if ((debit.affected ?? 0) !== 1) {
        this.logger.warn(
          `Transfer rejected: insufficient funds | ${transferMeta}`,
        );
        throw new ConflictException('Insufficient funds');
      }

      const credit = await this.userRepository.credit(
        recipientId,
        parsedAmount,
      );

      if ((credit.affected ?? 0) !== 1) {
        this.logger.warn(
          `Transfer rejected: recipient disappeared during transaction | ${transferMeta}`,
        );
        throw new NotFoundException('Recipient not found');
      }

      this.notificationClient.emit('transfer_completed', {
        authId,
        recipientId,
        amount: parsedAmount,
      });

      this.logger.log(`Transfer completed | ${transferMeta}`);
      this.logger.verbose(
        `Transfer transaction committed | ${transferMeta}, lockedUsers=${lockedUsers.length}`,
      );
    } catch (error) {
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Transfer failed | ${transferMeta}`, stack);
      throw error;
    }
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

  async listActiveUsers(params: ActiveUsersQueryDto) {
    const [data, total] = await this.userRepository.findManyByActivity(params);

    return { data, total };
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
