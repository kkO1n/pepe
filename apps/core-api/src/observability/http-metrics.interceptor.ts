import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { finalize, type Observable } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http' || !this.metricsService.isEnabled()) {
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
    const route = request.route as unknown;
    if (route && typeof route === 'object' && 'path' in route) {
      const routePath = (route as { path?: unknown }).path;
      if (typeof routePath === 'string' && routePath.length > 0) {
        const baseUrl = request.baseUrl ?? '';
        return `${baseUrl}${routePath}`;
      }
    }

    const requestPath = request.path as unknown;
    if (typeof requestPath === 'string' && requestPath.length > 0) {
      return requestPath;
    }

    const originalUrl = request.originalUrl as unknown;
    if (typeof originalUrl === 'string' && originalUrl.length > 0) {
      return originalUrl.split('?')[0];
    }

    return 'unknown';
  }
}
