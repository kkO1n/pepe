import { UserSession } from '../../../auth/entity/user-session.entity';
import { User } from '../../../features/users/entity/user.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

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
    entities: [User, UserSession],
    synchronize: parseSynchronize(process.env.DB_SYNCHRONIZE ?? 'false'),
    ...overrides,
  };
}
