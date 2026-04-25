import type { ConfigService } from '@nestjs/config';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

const DEFAULT_METRICS_PATH = '/metrics';

type HttpMetricLabels = 'method' | 'route' | 'status_code' | 'service';

export abstract class BaseMetricsService {
  protected readonly registry = new Registry();
  protected readonly metricsPath: string;
  protected readonly serviceName: string;
  private readonly httpRequestsTotal: Counter<HttpMetricLabels>;
  private readonly httpRequestDurationSeconds: Histogram<HttpMetricLabels>;

  protected constructor(config: ConfigService, defaultServiceName: string) {
    this.serviceName = config.get<string>('SERVICE_NAME') ?? defaultServiceName;
    this.metricsPath = this.normalizePath(
      config.get<string>('METRICS_PATH') ?? DEFAULT_METRICS_PATH,
    );

    this.httpRequestsTotal = new Counter<HttpMetricLabels>({
      name: 'http_requests_total',
      help: 'Total HTTP requests processed by the API',
      labelNames: ['method', 'route', 'status_code', 'service'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram<HttpMetricLabels>({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    collectDefaultMetrics({ register: this.registry });
  }

  getMetricsPath() {
    return this.metricsPath;
  }

  getContentType() {
    return this.registry.contentType;
  }

  async getMetrics() {
    return this.registry.metrics();
  }

  observeRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ) {
    const labels = {
      method: method.toUpperCase(),
      route,
      status_code: String(statusCode),
      service: this.serviceName,
    };

    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationSeconds.observe(labels, durationSeconds);
  }

  private normalizePath(path: string) {
    if (!path.startsWith('/')) {
      return `/${path}`;
    }
    return path;
  }
}
