import { initializeTransactionalContext } from 'typeorm-transactional';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'thedumbestsecret';
}

if (!process.env.SALT_ROUNDS) {
  process.env.SALT_ROUNDS = '10';
}

if (!process.env.REFRESH_TOKEN_HASH_SECRET) {
  process.env.REFRESH_TOKEN_HASH_SECRET = 'thetestiesthashiesthashsecret';
}

if (!process.env.REFRESH_TOKEN_TTL_DAYS) {
  process.env.REFRESH_TOKEN_TTL_DAYS = '7';
}

process.env.DB_HOST = process.env.DB_HOST ?? '127.0.0.1';
process.env.DB_PORT = process.env.DB_PORT ?? '5430';
process.env.DB_USER = process.env.DB_USER ?? 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'root';
process.env.DB_NAME = 'db_test';
process.env.DB_SYNCHRONIZE = 'false';
initializeTransactionalContext();
