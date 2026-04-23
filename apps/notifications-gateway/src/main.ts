import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { NotificationsGatewayModule } from './notifications-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsGatewayModule);
  const config = app.get(ConfigService);

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
