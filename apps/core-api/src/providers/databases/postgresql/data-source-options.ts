import { Avatar } from '@core-api/features/avatars/entity/avatar.entity';
import { User } from '@core-api/features/users/entity/user.entity';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSynchronize(value: string | undefined): boolean {
  return value === 'true';
}

export function getDatabaseOptions(
  overrides: Partial<PostgresConnectionOptions> = {},
): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parsePort(process.env.DB_PORT, 5430),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'root',
    database: process.env.DB_NAME ?? 'db',
    synchronize: parseSynchronize(process.env.DB_SYNCHRONIZE ?? 'true'),
    // Register local entities explicitly to avoid glob-based imports touching node_modules.
    entities: [User, Avatar],
    ...overrides,
  };
}
