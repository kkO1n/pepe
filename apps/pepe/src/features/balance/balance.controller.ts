import { Controller, Post } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balances')
export class BalanceController {
  constructor(private balanceJobsService: BalanceService) {}
  @Post('reset')
  enqueueReset() {
    return this.balanceJobsService.enqueueReset();
  }
}
