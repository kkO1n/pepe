import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);

  const port = process.env.PORT ?? 3001;

  await app.listen(Number(port), '0.0.0.0');
  console.log(`socket.io listens on ${port} port`);
}
void bootstrap();
