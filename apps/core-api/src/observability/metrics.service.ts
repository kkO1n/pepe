import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { BaseMetricsService } from '@observability/base-metrics.service';

@Injectable()
export class MetricsService extends BaseMetricsService {
  constructor(config: ConfigService) {
    super(config, 'core-api');
  }
}
