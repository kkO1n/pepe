import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { UserBalancesModule } from '../users-balances/user-balances.module';
import { BalanceController } from './balance.controller';
import { BalanceResetProcessor } from './balance.processor';
import { BalanceService } from './balance.service';

@Module({
  imports: [
    UserBalancesModule,
    BullModule.registerQueue({
      name: 'balance-reset',
    }),
  ],
  providers: [BalanceService, BalanceResetProcessor],
  controllers: [BalanceController],
})
export class BalanceModule {}
