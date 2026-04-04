import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/features/users/users.module';
import { AuthController } from './auth.controller';
import { userSessionRepositoryProvider } from './user-session.repository-provider';
import { DatabaseModule } from 'src/providers/databases/postgresql/postgresql.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [AuthService, userSessionRepositoryProvider],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
