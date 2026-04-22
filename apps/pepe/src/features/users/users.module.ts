import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@pepe/providers/databases/postgresql/postgresql.module';
import { UsersCacheInterceptor } from './interceptors/users-cache.interceptor';
import { UsersController } from './users.controller';
import { usersRepositoryProvider } from './users.repository-provider';
import { UsersService } from './users.service';

@Module({
  imports: [
    DatabaseModule,
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
  providers: [usersRepositoryProvider, UsersService, UsersCacheInterceptor],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
