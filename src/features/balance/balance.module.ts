import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { BalanceController } from './balance.controller';
import { BalanceResetProcessor } from './balance.processor';
import { BalanceService } from './balance.service';

@Module({
  imports: [
    UsersModule,
    BullModule.registerQueue({
      name: 'balance-reset',
    }),
  ],
  providers: [BalanceService, BalanceResetProcessor],
  controllers: [BalanceController],
})
export class BalanceModule {}
