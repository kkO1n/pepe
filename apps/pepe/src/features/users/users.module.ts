import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@pepe/providers/databases/postgresql/postgresql.module';
import { UsersCacheInterceptor } from './interceptors/users-cache.interceptor';
import { UsersController } from './users.controller';
import { usersRepositoryProvider } from './users.repository-provider';
import { UsersService } from './users.service';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
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
      },
    ]),
  ],
  providers: [usersRepositoryProvider, UsersService, UsersCacheInterceptor],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
