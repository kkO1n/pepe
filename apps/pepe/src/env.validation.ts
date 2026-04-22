import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_HASH_SECRET!: string;

  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(15)
  SALT_ROUNDS: number = 10;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string = 'localhost';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 5430;

  @IsString()
  @IsNotEmpty()
  DB_USER: string = 'root';

  @IsString()
  DB_PASSWORD: string = 'root';

  @IsString()
  @IsNotEmpty()
  DB_NAME: string = 'db';

  @Transform(
    ({ value }) =>
      value === true || value === 'true' || value === 1 || value === '1',
  )
  @IsBoolean()
  DB_SYNCHRONIZE: boolean = false;

  @IsNumber()
  @IsNotEmpty()
  REDIS_PORT: number = 6379;
  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string = 'localhost';
  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD: string = 'crazyassredispasswrod';

  @IsString()
  @IsNotEmpty()
  S3_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  S3_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  S3_ENDPOINT: string = 'http://127.0.0.1:9000';

  @IsString()
  @IsNotEmpty()
  S3_REGION: string = 'us-east-1';

  @IsString()
  @IsNotEmpty()
  S3_BUCKET_NAME: string = 'dabucket';

  @IsOptional()
  @IsString()
  S3_PUBLIC_BASE_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
