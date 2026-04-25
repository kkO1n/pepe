import { Module } from '@nestjs/common';
import { BaseMetricsService } from '@observability/base-metrics.service';
import { MetricsService } from './metrics.service';

@Module({
  providers: [
    MetricsService,
    {
      provide: BaseMetricsService,
      useExisting: MetricsService,
    },
  ],
  exports: [MetricsService, BaseMetricsService],
})
export class ObservabilityModule {}
