import { IUserRepository } from '@core-api/common/interfaces/user-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserBalancesService {
  constructor(private readonly userRepository: IUserRepository) {}

  async resetAllBalances(): Promise<void> {
    await this.userRepository.resetBalances();
  }
}
