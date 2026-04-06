import { Module } from '@nestjs/common';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './env.validation';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { APP_FILTER } from '@nestjs/core';
import { DBExceptionFilter } from './common/filters/db-exception.filter';
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
        genReqId(req) {
          return req.headers['x-request-id'] || randomUUID();
        },
      },
    }),
    UsersModule,
    AuthModule,
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
