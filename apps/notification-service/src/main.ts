import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
  console.log(process.env.PORT ?? 3000);
}
void bootstrap();
