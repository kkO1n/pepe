import { Module } from '@nestjs/common';
import { UsersModule } from '@pepe/features/users/users.module';
import { RedisModule } from '@pepe/providers/databases/redis/redis.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { userSessionRepositoryProvider } from './user-session.repository-provider';

@Module({
  imports: [RedisModule, UsersModule],
  providers: [AuthService, userSessionRepositoryProvider],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
