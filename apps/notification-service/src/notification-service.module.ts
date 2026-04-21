import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { validate } from './env.validation';
import { NotificationModule } from './features/notification/notification.module';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/notification-service/.env', '.env.shared', '.env'],
      validate,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    NotificationModule,
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
