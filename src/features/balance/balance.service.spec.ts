import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { BalanceService } from './balance.service';

describe('BalanceService', () => {
  let service: BalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: getQueueToken('balance-reset'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
