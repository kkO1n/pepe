import { INotificationEventsPort } from '@core-api/common/interfaces/notification-events-port.interface';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaNotificationEventsAdapter } from './kafka-notification-events.adapter';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
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
        }),
      },
    ]),
  ],
  providers: [
    {
      provide: INotificationEventsPort,
      useClass: KafkaNotificationEventsAdapter,
    },
  ],
  exports: [INotificationEventsPort],
})
export class NotificationsMessagingModule {}
