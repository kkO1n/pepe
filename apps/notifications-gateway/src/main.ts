import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { type Request, type Response } from 'express';
import { Logger } from 'nestjs-pino';
import { MetricsService } from './observability/metrics.service';
import { NotificationsGatewayModule } from './notifications-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsGatewayModule);
  const config = app.get(ConfigService);
  const metricsService = app.get(MetricsService);

  app.useLogger(app.get(Logger));

  if (metricsService.isEnabled()) {
    app.use(
      metricsService.getMetricsPath(),
      async (_req: Request, res: Response) => {
        res.type(metricsService.getContentType());
        res.send(await metricsService.getMetrics());
      },
    );
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: config.getOrThrow<string>('KAFKA_CLIENT_ID'),
        brokers: config
          .getOrThrow<string>('KAFKA_BROKERS')
          .split(',')
          .map((broker) => broker.trim())
          .filter(Boolean),
      },
      consumer: {
        groupId: config.getOrThrow<string>('KAFKA_CONSUMER_GROUP_ID'),
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(
    config.getOrThrow<number>('NOTIFICATION_SERVICE_PORT'),
    '0.0.0.0',
  );
}
void bootstrap();
