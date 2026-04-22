import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
