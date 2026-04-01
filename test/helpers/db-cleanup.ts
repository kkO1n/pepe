import { DataSource } from 'typeorm';
import { createMigrationDataSource } from '../../src/providers/databases/postgresql/typeorm-migration.datasource';

const DB_HOST = process.env.DB_HOST ?? 'localhost';
const DB_PORT = Number(process.env.DB_PORT ?? 5430);
const DB_USER = process.env.DB_USER ?? 'root';
const DB_PASSWORD = process.env.DB_PASSWORD ?? 'root';
const DB_NAME = process.env.DB_NAME ?? 'db_test';

export async function ensureTestDatabase(): Promise<void> {
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
  });

  await adminDataSource.initialize();
  const checkResult: Array<{ exists: boolean }> = await adminDataSource.query(
    'SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists',
    [DB_NAME],
  );

  if (!checkResult[0]?.exists) {
    await adminDataSource.query(`CREATE DATABASE "${DB_NAME}"`);
  }

  await adminDataSource.destroy();
}

export async function cleanupDatabase(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  await dataSource.initialize();
  await dataSource.query(
    'TRUNCATE TABLE "user_sessions", "user" RESTART IDENTITY CASCADE',
  );
  await dataSource.destroy();
}

export async function runMigrations(): Promise<void> {
  const dataSource = createMigrationDataSource();
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
