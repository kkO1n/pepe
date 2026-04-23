import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Job } from 'bullmq';
import { UserBalancesService } from '../users-balances/user-balances.service';
import { BalanceResetProcessor } from './balance.processor';

describe('BalanceResetProcessor', () => {
  let processor: BalanceResetProcessor;
  let userBalancesService: { resetAllBalances: jest.Mock };

  beforeEach(async () => {
    userBalancesService = {
      resetAllBalances: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceResetProcessor,
        {
          provide: UserBalancesService,
          useValue: userBalancesService,
        },
      ],
    }).compile();

    processor = module.get(BalanceResetProcessor);
  });

  it('resets balances for reset-all-balances job', async () => {
    const job = {
      id: '1',
      name: 'reset-all-balances',
      data: {},
    } as unknown as Job;

    await processor.process(job);

    expect(userBalancesService.resetAllBalances).toHaveBeenCalledTimes(1);
  });
});
