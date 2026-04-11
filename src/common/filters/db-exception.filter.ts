import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { QueryFailedError } from 'typeorm';
import { getPostgresErrorMapping } from '../errors/postgres-error.map';

type PgDriverError = { code?: string };

@Injectable()
@Catch(QueryFailedError)
export class DBExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(
    exception: QueryFailedError & { driverError?: PgDriverError },
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const pgCode = exception.driverError?.code;

    this.logger.error(
      {
        path: req.url,
        method: req.method,
        pgCode: exception.driverError?.code,
        err: exception,
      },
      'Database query failed',
    );

    const mapped = getPostgresErrorMapping(pgCode);

    const status = mapped?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(status).json({
      statusCode: status,
      code: mapped?.code ?? 'DB_QUERY_FAILED',
      message: mapped?.message ?? 'Database error',
      path: req.url,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] ?? null,
    });
  }
}
