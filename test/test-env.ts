if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'thedumbestsecret';
}

if (!process.env.SALT_ROUNDS) {
  process.env.SALT_ROUNDS = '10';
}

process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '5430';
process.env.DB_USER = process.env.DB_USER ?? 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'root';
process.env.DB_NAME = process.env.DB_NAME ?? 'db_test';
process.env.DB_SYNCHRONIZE = process.env.DB_SYNCHRONIZE ?? 'true';
