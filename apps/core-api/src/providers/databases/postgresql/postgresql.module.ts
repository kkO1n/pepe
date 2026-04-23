import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATA_SOURCE } from '@core-api/common/constants';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { getDatabaseOptions } from './data-source-options';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      const dataSource = new DataSource(
        getDatabaseOptions(
          {},
          {
            DB_HOST: config.getOrThrow<string>('DB_HOST'),
            DB_PORT: config.getOrThrow<number>('DB_PORT'),
            DB_USER: config.getOrThrow<string>('DB_USER'),
            DB_PASSWORD: config.getOrThrow<string>('DB_PASSWORD'),
            DB_NAME: config.getOrThrow<string>('DB_NAME'),
            DB_SYNCHRONIZE: config.getOrThrow<boolean>('DB_SYNCHRONIZE'),
          },
        ),
      );

      addTransactionalDataSource(dataSource);

      return dataSource.initialize();
    },
  },
];

@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
