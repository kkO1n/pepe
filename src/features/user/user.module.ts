import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DataSource } from 'typeorm';
import { User } from './entity/user.entity';
import { DATA_SOURCE, USER_REPOSITORY } from 'src/common/constants';
import { DatabaseModule } from 'src/providers/databases/postgresql/postgresql.module';

export const userProviders = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DATA_SOURCE],
  },
];

@Module({
  imports: [DatabaseModule],
  providers: [...userProviders, UserService],
  exports: [UserService],
})
export class UserModule {}
