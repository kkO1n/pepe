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

process.env.REDIS_HOST = process.env.REDIS_HOST ?? '127.0.0.1';
process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6379';
process.env.REDIS_PASSWORD =
  process.env.REDIS_PASSWORD ?? 'crazyassredispassword';

process.env.S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID ?? 'minioroot';
process.env.S3_SECRET_ACCESS_KEY =
  process.env.S3_SECRET_ACCESS_KEY ?? 'minioroot';
process.env.S3_ENDPOINT = process.env.S3_ENDPOINT ?? 'http://127.0.0.1:9000';
process.env.S3_REGION = process.env.S3_REGION ?? 'us-east-1';
process.env.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME ?? 'dabucket';
process.env.KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID ?? 'notification';
process.env.KAFKA_BROKERS = process.env.KAFKA_BROKERS ?? 'localhost:9092';
process.env.KAFKA_CONSUMER_GROUP_ID =
  process.env.KAFKA_CONSUMER_GROUP_ID ?? 'notification-consumer';
initializeTransactionalContext();
