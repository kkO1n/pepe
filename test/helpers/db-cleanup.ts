import { DataSource } from 'typeorm';
import { createMigrationDataSource } from '../../src/providers/databases/postgresql/typeorm-migration.datasource';

function getDbConfig() {
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5430),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'root',
    database: process.env.DB_NAME ?? 'db_test',
  };
}

export async function ensureTestDatabase(): Promise<void> {
  const dbConfig = getDbConfig();
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: 'postgres',
  });

  await adminDataSource.initialize();
  const checkResult: Array<{ exists: boolean }> = await adminDataSource.query(
    'SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists',
    [dbConfig.database],
  );

  if (!checkResult[0]?.exists) {
    await adminDataSource.query(`CREATE DATABASE "${dbConfig.database}"`);
  }

  await adminDataSource.destroy();
}

export async function cleanupDatabase(): Promise<void> {
  const dbConfig = getDbConfig();
  const dataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  await dataSource.initialize();
  await dataSource.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');
  await dataSource.destroy();
}

export async function runMigrations(): Promise<void> {
  const dataSource = createMigrationDataSource();
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
