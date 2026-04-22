import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from './env.validation';
import { NotificationModule } from './features/notification/notification.module';
import { NotificationsGatewayController } from './notifications-gateway.controller';
import { NotificationsGatewayService } from './notifications-gateway.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/notifications-gateway/.env', '.env.shared', '.env'],
      validate,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    NotificationModule,
  ],
  controllers: [NotificationsGatewayController],
  providers: [NotificationsGatewayService],
})
export class NotificationsGatewayModule {}
