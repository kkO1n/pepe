import { Module } from '@nestjs/common';
import { DATA_SOURCE } from '@pepe/common/constants';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { getDatabaseOptions } from './data-source-options';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource(getDatabaseOptions());

      addTransactionalDataSource(dataSource);

      return dataSource.initialize();
    },
  },
];

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
