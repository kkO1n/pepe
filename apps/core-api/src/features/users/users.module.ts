import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core-api/providers/databases/postgresql/postgresql.module';
import { NotificationsMessagingModule } from '@core-api/providers/messaging/notifications-messaging.module';
import { UsersCacheInterceptor } from './interceptors/users-cache.interceptor';
import { UsersController } from './users.controller';
import { usersRepositoryProvider } from './users.repository-provider';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, NotificationsMessagingModule],
  providers: [usersRepositoryProvider, UsersService, UsersCacheInterceptor],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
