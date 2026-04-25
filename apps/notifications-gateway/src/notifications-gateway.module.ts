import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import { HttpMetricsInterceptor } from '@observability/http-metrics.interceptor';
import { validate } from './env.validation';
import { NotificationModule } from './features/notification/notification.module';
import { ObservabilityModule } from './observability/observability.module';
import { NotificationsGatewayController } from './notifications-gateway.controller';
import { NotificationsGatewayService } from './notifications-gateway.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/notifications-gateway/.env'],
      validate,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const serviceName =
          config.get<string>('SERVICE_NAME') ?? 'notifications-gateway';
        const env = config.getOrThrow<string>('NODE_ENV');
        const level = config.get<string>('LOG_LEVEL') ?? 'info';
        const pretty =
          (config.get<boolean>('LOG_PRETTY') ?? false) &&
          !(config.get<boolean>('CONTAINERIZED') ?? false);

        return {
          pinoHttp: {
            level,
            transport: pretty
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                  },
                }
              : undefined,
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
    NotificationModule,
    ObservabilityModule,
  ],
  controllers: [NotificationsGatewayController],
  providers: [
    NotificationsGatewayService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class NotificationsGatewayModule {}
