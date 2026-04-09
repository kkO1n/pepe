import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BalanceService implements OnModuleInit {
  constructor(@InjectQueue('balance-reset') private queue: Queue) {}

  async enqueueReset() {
    await this.queue.add('reset-all-balances', {}, { removeOnComplete: true });
  }

  async onModuleInit() {
    await this.queue.add(
      'reset-all-balances',
      {},
      {
        repeat: { every: 10 * 60 * 1000 },
        jobId: 'reset-all-balances-every-10-min',
        removeOnComplete: true,
      },
    );
  }
}
