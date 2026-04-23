import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core-api/providers/databases/postgresql/postgresql.module';
import { usersRepositoryProvider } from '@core-api/features/users/users.repository-provider';
import { UserBalancesService } from './user-balances.service';

@Module({
  imports: [DatabaseModule],
  providers: [usersRepositoryProvider, UserBalancesService],
  exports: [UserBalancesService],
})
export class UserBalancesModule {}
