import { Avatar } from '@core-api/features/avatars/entity/avatar.entity';
import { User } from '@core-api/features/users/entity/user.entity';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type DatabaseEnv = {
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SYNCHRONIZE: boolean;
};

export function getDatabaseOptions(
  overrides: Partial<PostgresConnectionOptions> = {},
  env: DatabaseEnv,
): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    synchronize: env.DB_SYNCHRONIZE,
    entities: [User, Avatar],
    ...overrides,
  };
}
