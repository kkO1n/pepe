import { Inject, Injectable } from '@nestjs/common';
import { DATA_SOURCE } from 'src/common/constants';
import { IUserSessionRepository } from 'src/common/interfaces/user-session-repository.interface';
import { BaseRepository } from 'src/features/base.repository';
import {
  DataSource,
  EntityManager,
  LessThanOrEqual,
  MoreThan,
  Repository,
} from 'typeorm';
import { UserSessions } from './entity/user-session.entity';

@Injectable()
export class UserSessionRepository
  extends BaseRepository
  implements IUserSessionRepository
{
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    super(dataSource);
  }

  private sessionRepository(
    entityManager?: EntityManager,
  ): Repository<UserSessions> {
    return this.getRepository(UserSessions, entityManager);
  }

  async findValidByToken(
    refreshToken: string,
    now: Date = new Date(),
  ): Promise<UserSessions | null> {
    return this.sessionRepository().findOne({
      where: {
        refreshToken,
        expiresAt: MoreThan(now),
      },
    });
  }

  async upsertForUser(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.sessionRepository().upsert(
      {
        userId,
        refreshToken,
        expiresAt,
      },
      ['userId'],
    );
  }

  async deleteByToken(refreshToken: string): Promise<void> {
    await this.sessionRepository().delete({ refreshToken });
  }

  async deleteExpired(now: Date = new Date()): Promise<void> {
    await this.sessionRepository().delete({
      expiresAt: LessThanOrEqual(now),
    });
  }
}
