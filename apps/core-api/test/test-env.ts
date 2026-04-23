import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import { validate, type EnvironmentVariables } from '@core-api/env.validation';
import { initializeTransactionalContext } from 'typeorm-transactional';

loadDotenv({ path: resolve(process.cwd(), 'apps/core-api/.env') });

export const coreApiTestEnv: EnvironmentVariables = validate({
  ...process.env,
  NODE_ENV: 'test',
  DB_NAME: 'db_test',
  DB_SYNCHRONIZE: 'false',
  JWT_SECRET: 'thedumbestsecret',
  SALT_ROUNDS: '10',
  REFRESH_TOKEN_HASH_SECRET: 'thetestiesthashiesthashsecret',
  DB_HOST: '127.0.0.1',
  DB_PORT: '5430',
  DB_USER: 'root',
  DB_PASSWORD: 'root',
  REDIS_HOST: '127.0.0.1',
  REDIS_PORT: '6379',
  REDIS_PASSWORD: 'crazyassredispassword',
  S3_ACCESS_KEY_ID: 'minioroot',
  S3_SECRET_ACCESS_KEY: 'minioroot',
  S3_ENDPOINT: 'http://127.0.0.1:9000',
  S3_REGION: 'us-east-1',
  S3_BUCKET_NAME: 'dabucket',
  KAFKA_CLIENT_ID: 'notification',
  KAFKA_BROKERS: 'localhost:9092',
  KAFKA_CONSUMER_GROUP_ID: 'notification-consumer',
});

for (const [key, value] of Object.entries(coreApiTestEnv)) {
  process.env[key] = String(value);
}
initializeTransactionalContext();
