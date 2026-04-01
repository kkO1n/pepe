import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/features/users/users.module';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { userSessionRepositoryProvider } from './user-session.repository-provider';
import { DatabaseModule } from 'src/providers/databases/postgresql/postgresql.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '5m' },
    }),
    ConfigModule,
  ],
  providers: [AuthService, userSessionRepositoryProvider],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
