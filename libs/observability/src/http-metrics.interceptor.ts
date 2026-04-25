import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { finalize, type Observable } from 'rxjs';
import { BaseMetricsService } from './base-metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: BaseMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
        const route = this.resolveRoute(request);
        const statusCode = response.statusCode ?? 500;
        this.metricsService.observeRequest(
          request.method ?? 'UNKNOWN',
          route,
          statusCode,
          durationSeconds,
        );
      }),
    );
  }

  private resolveRoute(request: Request) {
    const route = request.route as { path?: string } | undefined;
    if (typeof route?.path === 'string' && route.path.length > 0) {
      return `${request.baseUrl ?? ''}${route.path}`;
    }

    const requestPath = request.path;
    if (requestPath.length > 0) {
      return requestPath;
    }

    const originalUrl = request.originalUrl;
    if (originalUrl.length > 0) {
      return originalUrl.split('?')[0];
    }

    return 'unknown';
  }
}
