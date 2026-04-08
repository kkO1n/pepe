import { Inject, Injectable } from '@nestjs/common';
import { DATA_SOURCE } from 'src/common/constants';
import { IUserRepository } from 'src/common/interfaces/user-repository.interface';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';
import { BaseRepository } from '../base.repository';
import { CreateUserDto } from './dto/create-user-dto';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    super(dataSource);
  }

  private userRepository(entityManager?: EntityManager): Repository<User> {
    return this.getRepository(User, entityManager);
  }

  async findManyByActivity(minAge: number, maxAge: number) {
    return await this.userRepository()
      .createQueryBuilder('u')
      .where('u.age BETWEEN :minAge AND :maxAge', { minAge, maxAge })
      .andWhere(`NULLIF(TRIM(u.description), '') IS NOT NULL`)
      .andWhere(
        `
      EXISTS (
        SELECT 1
        FROM avatars a
        WHERE a."userId" = u.id
          AND a."deletedAt" IS NULL
        GROUP BY a."userId"
        HAVING COUNT(a.id) > 2
      )
    `,
      )
      .orderBy('u.id', 'ASC')
      .getManyAndCount();
  }

  async findManyByLogin({
    page,
    limit,
    login,
  }: GetUsersQueryDto): Promise<[User[], number]> {
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository().save(createUserDto);
  }

  async update(id: number, putUserDto: UpdateUserDto): Promise<User> {
    return this.userRepository().save({
      id,
      ...putUserDto,
    });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.userRepository().softDelete(id);
  }
}
