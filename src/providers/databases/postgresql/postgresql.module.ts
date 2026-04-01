import { Module } from '@nestjs/common';
import { DATA_SOURCE } from 'src/common/constants';
import { User } from 'src/features/users/entity/user.entity';
import { DataSource } from 'typeorm';

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parsePort(process.env.DB_PORT, 5430),
        username: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? 'root',
        database: process.env.DB_NAME ?? 'db',
        entities: [User],
        synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') !== 'false',
      });

      return dataSource.initialize();
    },
  },
];

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
