import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import {
  IUserSessionRepository,
  SessionLookupResult,
} from '@pepe/common/interfaces/user-session-repository.interface';
import { REDIS } from '@pepe/providers/databases/redis/redis.module';
import { AUTH_SESSION_TOKEN_KEY_PREFIX } from './auth.constants';

@Injectable()
export class UserSessionRepository implements IUserSessionRepository {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  private tokenKey(refreshTokenHash: string): string {
    return `${AUTH_SESSION_TOKEN_KEY_PREFIX}${refreshTokenHash}`;
  }

  async create(
    userId: number,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    const ttlSeconds = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
    if (ttlSeconds <= 0) return;

    await this.redis.set(
      this.tokenKey(refreshTokenHash),
      String(userId),
      'EX',
      ttlSeconds,
    );
  }

  async findUserByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<SessionLookupResult | null> {
    const rawUserId = await this.redis.get(this.tokenKey(refreshTokenHash));
    if (!rawUserId) return null;

    return { userId: Number(rawUserId) };
  }

  async revokeByRefreshTokenHash(refreshTokenHash: string): Promise<void> {
    await this.redis.del(this.tokenKey(refreshTokenHash));
  }
}
