import { Module } from '@nestjs/common';
import { DATA_SOURCE } from 'src/common/constants';
import { User } from 'src/features/user/entity/user.entity';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5430,
        username: 'root',
        password: 'root',
        database: 'db',
        entities: [User],
        synchronize: true,
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
