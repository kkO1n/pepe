import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { NotificationsGatewayModule } from './notifications-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsGatewayModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notification',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'notification-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(
    Number(process.env.NOTIFICATION_SERVICE_PORT ?? 3002),
    '0.0.0.0',
  );
}
void bootstrap();
