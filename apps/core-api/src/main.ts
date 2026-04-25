import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { type Request, type Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from 'nestjs-pino';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { MetricsService } from './observability/metrics.service';
import { AppModule } from './app.module';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const metricsService = app.get(MetricsService);

  app.use(
    metricsService.getMetricsPath(),
    async (_req: Request, res: Response) => {
      res.type(metricsService.getContentType());
      res.send(await metricsService.getMetrics());
    },
  );

  app.use(
    '/notifications/socket.io',
    createProxyMiddleware({
      target: configService.getOrThrow<string>('NOTIFICATION_SERVICE_ORIGIN'),
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/notifications': '',
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Core API')
    .setDescription('Core API description')
    .setVersion('1.0')
    .addTag('core-api')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(configService.getOrThrow<number>('PORT'));
}

void bootstrap();
