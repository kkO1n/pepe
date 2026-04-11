import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/providers/databases/postgresql/postgresql.module';
import { usersRepositoryProvider } from './users.repository-provider';
import { UsersController } from './users.controller';
import { UsersCacheInterceptor } from './interceptors/users-cache.interceptor';

@Module({
  imports: [DatabaseModule],
  providers: [usersRepositoryProvider, UsersService, UsersCacheInterceptor],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
