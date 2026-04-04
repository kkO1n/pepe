import { Module } from '@nestjs/common';
import { DATA_SOURCE } from 'src/common/constants';
import { DataSource } from 'typeorm';
import { getDatabaseOptions } from './data-source-options';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource(getDatabaseOptions());

      return dataSource.initialize();
    },
  },
];

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
