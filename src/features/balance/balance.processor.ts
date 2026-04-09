import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { UsersService } from '../users/users.service';

@Processor('balance-reset')
export class BalanceResetProcessor extends WorkerHost {
  private readonly logger = new Logger(BalanceResetProcessor.name);

  constructor(private readonly usersService: UsersService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`job ${job.id} is processing ${job.name}`);
    this.logger.verbose(job);
    if (job.name === 'reset-all-balances') {
      await this.usersService.resetAllBalances();
    }
    this.logger.log(`job ${job.id} is processing ${job.name}`);
  }
}
