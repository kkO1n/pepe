import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/features/users/users.module';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET_KEY}`,
      signOptions: { expiresIn: '60s' },
    }),
    ConfigModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
