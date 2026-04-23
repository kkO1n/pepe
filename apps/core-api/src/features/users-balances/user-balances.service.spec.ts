import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { IUserRepository } from '@core-api/common/interfaces/user-repository.interface';
import { UserBalancesService } from './user-balances.service';

describe('UserBalancesService', () => {
  let service: UserBalancesService;
  let userRepository: { resetBalances: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      resetBalances: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserBalancesService,
        {
          provide: IUserRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get(UserBalancesService);
  });

  it('delegates reset to repository', async () => {
    await service.resetAllBalances();

    expect(userRepository.resetBalances).toHaveBeenCalledTimes(1);
  });
});
