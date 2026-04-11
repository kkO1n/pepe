import { CACHE_TTL_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';

@Injectable()
export class UsersCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(UsersCacheInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    if (!this.isRequestCacheable(context)) {
      this.logger.debug('Cache bypass: request is not cacheable');
      return next.handle();
    }

    const key = this.trackBy(context);
    if (!key) {
      this.logger.debug('Cache bypass: key is undefined');
      return next.handle();
    }

    const ttl =
      this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ??
      this.reflector.get<number>(CACHE_TTL_METADATA, context.getClass());

    try {
      const cache = this.cacheManager as Cache;
      const cachedResponse = await cache.get(key);

      if (cachedResponse !== undefined && cachedResponse !== null) {
        this.logger.log(`Cache hit | key=${key} | ttl=${ttl ?? 'default'}`);
        this.setHeadersWhenHttp(context, cachedResponse);
        return of(cachedResponse);
      }

      this.logger.log(`Cache miss | key=${key} | ttl=${ttl ?? 'default'}`);
      this.logger.verbose(`Cache lookup completed for key=${key}`);
      return super.intercept(context, next);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Cache read failed | key=${key} | reason=${message}`);
      return next.handle();
    }
  }
}
