import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BalanceService implements OnModuleInit {
  private readonly logger = new Logger(BalanceService.name);

  constructor(@InjectQueue('balance-reset') private queue: Queue) {}

  async enqueueReset() {
    this.logger.log('Enqueue reset balances job requested');

    try {
      const job = await this.queue.add(
        'reset-all-balances',
        {},
        { removeOnComplete: true },
      );
      this.logger.log(`Enqueued reset balances job | jobId=${job.id}`);
      this.logger.debug(`Queue name=${this.queue.name} | jobName=${job.name}`);
    } catch (error) {
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Failed to enqueue reset balances job', stack);
      throw error;
    }
  }

  async onModuleInit() {
    this.logger.log('Registering repeatable reset balances job');
    try {
      const job = await this.queue.add(
        'reset-all-balances',
        {},
        {
          repeat: { every: 10 * 60 * 1000 },
          jobId: 'reset-all-balances-every-10-min',
          removeOnComplete: true,
        },
      );

      this.logger.log(`Repeatable reset job registered | jobId=${job.id}`);
      this.logger.verbose(
        'Repeat policy: every 10 minutes while application is running',
      );
    } catch (error) {
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Failed to register repeatable reset job', stack);
      throw error;
    }
  }
}
