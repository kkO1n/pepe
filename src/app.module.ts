import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DBExceptionFilter } from './common/filters/db-exception.filter';
import { validate } from './env.validation';
import { AvatarsModule } from './features/avatars/avatars.module';
import { UsersModule } from './features/users/users.module';
import { S3Module } from './providers/files/s3/s3.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
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
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
        genReqId(req) {
          return req.headers['x-request-id'] || randomUUID();
        },
      },
    }),
    S3Module,
    UsersModule,
    AuthModule,
    AvatarsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DBExceptionFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
