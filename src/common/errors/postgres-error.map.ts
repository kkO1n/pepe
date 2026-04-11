import { HttpStatus } from '@nestjs/common';

export type PostgresErrorCode = '23505' | '23503' | '23502' | '22P02';

export type DbErrorMapping = Readonly<{
  status: HttpStatus;
  code:
    | 'DB_UNIQUE_VIOLATION'
    | 'DB_FOREIGN_KEY_VIOLATION'
    | 'DB_NOT_NULL_VIOLATION'
    | 'DB_INVALID_INPUT';
  message: string;
}>;

export const POSTGRES_ERROR_MAP = {
  '23505': {
    status: HttpStatus.CONFLICT,
    code: 'DB_UNIQUE_VIOLATION',
    message: 'Resource already exists',
  },
  '23503': {
    status: HttpStatus.CONFLICT,
    code: 'DB_FOREIGN_KEY_VIOLATION',
    message: 'Related resource does not exist',
  },
  '23502': {
    status: HttpStatus.BAD_REQUEST,
    code: 'DB_NOT_NULL_VIOLATION',
    message: 'Required field is missing',
  },
  '22P02': {
    status: HttpStatus.BAD_REQUEST,
    code: 'DB_INVALID_INPUT',
    message: 'Invalid input format',
  },
} as const satisfies Record<PostgresErrorCode, DbErrorMapping>;

function isPostgresErrorCode(value: string): value is PostgresErrorCode {
  return Object.hasOwn(POSTGRES_ERROR_MAP, value);
}

export function getPostgresErrorMapping(
  code: unknown,
): DbErrorMapping | undefined {
  if (typeof code !== 'string' || !isPostgresErrorCode(code)) return undefined;
  return POSTGRES_ERROR_MAP[code];
}
