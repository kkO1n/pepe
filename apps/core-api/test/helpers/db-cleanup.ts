import { DataSource } from 'typeorm';
import { createMigrationDataSource } from '../../src/providers/databases/postgresql/typeorm-migration.datasource';
import { coreApiTestEnv } from '../test-env';

function getDbConfig() {
  return {
    host: coreApiTestEnv.DB_HOST,
    port: coreApiTestEnv.DB_PORT,
    username: coreApiTestEnv.DB_USER,
    password: coreApiTestEnv.DB_PASSWORD,
    database: coreApiTestEnv.DB_NAME,
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
