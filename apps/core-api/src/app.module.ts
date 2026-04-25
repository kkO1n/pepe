import KeyvRedis from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { CacheableMemory } from 'cacheable';
import { randomUUID } from 'crypto';
import { Keyv } from 'keyv';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { DBExceptionFilter } from './common/filters/db-exception.filter';
import { validate } from './env.validation';
import { AvatarsModule } from './features/avatars/avatars.module';
import { BalanceModule } from './features/balance/balance.module';
import { UsersModule } from './features/users/users.module';
import { HttpMetricsInterceptor } from './observability/http-metrics.interceptor';
import { ObservabilityModule } from './observability/observability.module';
import { RedisModule } from './providers/databases/redis/redis.module';
import { S3Module } from './providers/files/s3/s3.module';

function toBoolean(value: unknown, defaultValue: boolean) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }

  return defaultValue;
}

function hasPinoPrettyInstalled() {
  try {
    require.resolve('pino-pretty');
    return true;
  } catch {
    return false;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['apps/core-api/.env'],
      validate,
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5m' },
      }),
      global: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const serviceName = config.get<string>('SERVICE_NAME') ?? 'core-api';
        const env = config.getOrThrow<string>('NODE_ENV');
        const containerized = toBoolean(config.get('CONTAINERIZED'), false);
        const pretty =
          toBoolean(config.get('LOG_PRETTY'), false) && !containerized;
        const level = config.get<string>('LOG_LEVEL') ?? 'info';
        const prettyTransport =
          pretty && hasPinoPrettyInstalled()
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined;

        return {
          pinoHttp: {
            level,
            transport: prettyTransport,
            genReqId(req) {
              return req.headers['x-request-id'] || randomUUID();
            },
            customProps() {
              return {
                service: serviceName,
                env,
              };
            },
          },
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(
              `redis://:${encodeURIComponent(configService.getOrThrow('REDIS_PASSWORD'))}` +
                `@${configService.getOrThrow('REDIS_HOST')}:${configService.getOrThrow('REDIS_PORT')}`,
            ),
          ],
        };
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow('REDIS_HOST'),
          port: Number(config.getOrThrow('REDIS_PORT')),
          password: config.getOrThrow('REDIS_PASSWORD'),
        },
      }),
    }),
    S3Module,
    UsersModule,
    AuthModule,
    AvatarsModule,
    RedisModule,
    BalanceModule,
    ObservabilityModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DBExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class AppModule {}
