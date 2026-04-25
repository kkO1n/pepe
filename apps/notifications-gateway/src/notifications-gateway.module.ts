import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import { validate } from './env.validation';
import { NotificationModule } from './features/notification/notification.module';
import { HttpMetricsInterceptor } from './observability/http-metrics.interceptor';
import { ObservabilityModule } from './observability/observability.module';
import { NotificationsGatewayController } from './notifications-gateway.controller';
import { NotificationsGatewayService } from './notifications-gateway.service';

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
