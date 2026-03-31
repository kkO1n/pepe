import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/providers/databases/postgresql/postgresql.module';
import { usersRepositoryProvider } from './users.repository-provider';

@Module({
  imports: [DatabaseModule],
  providers: [usersRepositoryProvider, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
