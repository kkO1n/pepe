import { Inject, Injectable } from '@nestjs/common';
import { DATA_SOURCE } from '@pepe/common/constants';
import { IUserRepository } from '@pepe/common/interfaces/user-repository.interface';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';
import { BaseRepository } from '../base.repository';
import {
  ActiveUserListItem,
  ActiveUsersQueryParams,
  CreateUserPayload,
  ListUsersParams,
  UpdateUserPayload,
} from './types/user-repository.types';
import { User } from './entity/user.entity';

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    super(dataSource);
  }

  private userRepository(entityManager?: EntityManager): Repository<User> {
    return this.getRepository(User, entityManager);
  }

  async resetBalances(): Promise<void> {
    await this.userRepository()
      .createQueryBuilder()
      .update(User)
      .set({ balance: () => '10000' })
      .where('"deletedAt" IS NULL')
      .execute();
  }

  async lockUsers(minId: number, maxId: number) {
    return await this.userRepository()
      .createQueryBuilder('u')
      .setLock('pessimistic_write')
      .where('u.id IN (:...ids)', { ids: [minId, maxId] })
      .andWhere('u.deletedAt IS NULL')
      .getMany();
  }

  async debit(authId: number, amount: number) {
    return await this.userRepository()
      .createQueryBuilder()
      .update(User)
      .set({ balance: () => `balance - :amount` })
      .where('id = :authId', { authId })
      .andWhere('deletedAt IS NULL')
      .andWhere('balance >= :amount')
      .setParameters({ amount: amount.toFixed(2) })
      .execute();
  }

  async credit(recipientId: number, amount: number) {
    return await this.userRepository()
      .createQueryBuilder()
      .update(User)
      .set({ balance: () => `balance + :amount` })
      .where('id = :recipientId', { recipientId })
      .andWhere('deletedAt IS NULL')
      .setParameters({ amount: amount.toFixed(2) })
      .execute();
  }

  async findManyByActivity({
    minAge,
    maxAge,
  }: ActiveUsersQueryParams): Promise<[ActiveUserListItem[], number]> {
    const baseQuery = this.userRepository()
      .createQueryBuilder('u')
      .where('u.age BETWEEN :minAge AND :maxAge', { minAge, maxAge })
      .andWhere(`NULLIF(TRIM(u.description), '') IS NOT NULL`)
      .andWhere(
        `
        (
          SELECT COUNT(a.id)
          FROM avatar a
          WHERE a."userId" = u.id
            AND a."deletedAt" IS NULL
        ) > 2
      `,
      );

    const total = await baseQuery.getCount();

    const rawRows = await baseQuery
      .clone()
      .select([
        'u.id AS "id"',
        'u.login AS "login"',
        'u.email AS "email"',
        'u.age AS "age"',
        'u.balance AS "balance"',
        'u.description AS "description"',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('a.url')
            .from('avatar', 'a')
            .where('a."userId" = u.id')
            .andWhere('a."deletedAt" IS NULL')
            .orderBy('a."createdAt"', 'DESC')
            .addOrderBy('a.id', 'DESC')
            .limit(1),
        'latestAvatarPath',
      )
      .orderBy('u.id', 'ASC')
      .getRawMany<ActiveUserListItem>();

    return [rawRows, total];
  }

  async findManyByLogin({
    page,
    limit,
    login,
  }: ListUsersParams): Promise<[User[], number]> {
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;
    const trimmedLogin = login?.trim();

    return this.userRepository().findAndCount({
      where: trimmedLogin ? { login: ILike(`%${trimmedLogin}%`) } : {},
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      order: { id: 'ASC' },
    });
  }

  async findById(userId: number): Promise<User | null> {
    return this.userRepository().findOne({
      where: { id: userId },
    });
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.userRepository().findOne({
      where: { login },
    });
  }

  async create(createUserDto: CreateUserPayload): Promise<User> {
    return this.userRepository().save(createUserDto);
  }

  async update(id: number, putUserDto: UpdateUserPayload): Promise<User> {
    return this.userRepository().save({
      id,
      ...putUserDto,
    });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.userRepository().softDelete(id);
  }
}
