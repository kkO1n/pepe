import { join } from 'path';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import { validate } from '@core-api/env.validation';
import { DataSource } from 'typeorm';
import { getDatabaseOptions } from './data-source-options';

export function createMigrationDataSource(): DataSource {
  loadDotenv({ path: resolve(process.cwd(), 'apps/core-api/.env') });
  const env = validate(process.env as Record<string, unknown>);

  return new DataSource(
    getDatabaseOptions(
      {
        synchronize: false,
        migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
      },
      {
        DB_HOST: env.DB_HOST,
        DB_PORT: env.DB_PORT,
        DB_USER: env.DB_USER,
        DB_PASSWORD: env.DB_PASSWORD,
        DB_NAME: env.DB_NAME,
        DB_SYNCHRONIZE: env.DB_SYNCHRONIZE,
      },
    ),
  );
}

export default createMigrationDataSource();
