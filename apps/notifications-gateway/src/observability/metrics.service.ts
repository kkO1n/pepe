import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMetricsService } from '@observability/base-metrics.service';
import { Counter } from 'prom-client';

type NotificationMetricLabels = 'source' | 'type' | 'service';

@Injectable()
export class MetricsService extends BaseMetricsService {
  private readonly notificationsEmittedTotal: Counter<NotificationMetricLabels>;

  constructor(config: ConfigService) {
    super(config, 'notifications-gateway');

    this.notificationsEmittedTotal = new Counter<NotificationMetricLabels>({
      name: 'notifications_emitted_total',
      help: 'Total notifications emitted by the gateway',
      labelNames: ['source', 'type', 'service'],
      registers: [this.registry],
    });
  }

  observeNotification(source: 'http' | 'kafka', type: string) {
    this.notificationsEmittedTotal.inc({
      source,
      type,
      service: this.serviceName,
    });
  }
}
