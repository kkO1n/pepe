import { join } from 'path';
import { DataSource } from 'typeorm';
import { getDatabaseOptions } from './data-source-options';

export function createMigrationDataSource(): DataSource {
  return new DataSource(
    getDatabaseOptions({
      synchronize: false,
      migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    }),
  );
}

export default createMigrationDataSource();
