import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { UserBalancesService } from '../users-balances/user-balances.service';

@Processor('balance-reset')
export class BalanceResetProcessor extends WorkerHost {
  private readonly logger = new Logger(BalanceResetProcessor.name);

  constructor(private readonly userBalancesService: UserBalancesService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Job started | id=${job.id} | name=${job.name}`);
    this.logger.verbose(
      `Job payload | id=${job.id} | name=${job.name} | data=${JSON.stringify(job.data)}`,
    );

    try {
      if (job.name === 'reset-all-balances') {
        await this.userBalancesService.resetAllBalances();
        this.logger.debug(`Balances reset completed | jobId=${job.id}`);
      } else {
        this.logger.warn(
          `Unknown job skipped | id=${job.id} | name=${job.name}`,
        );
      }
      this.logger.log(`Job completed | id=${job.id} | name=${job.name}`);
    } catch (error) {
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Job failed | id=${job.id} | name=${job.name}`, stack);
      throw error;
    }
  }
}
