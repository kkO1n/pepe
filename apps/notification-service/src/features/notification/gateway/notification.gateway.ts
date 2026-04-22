import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('Initialized');
  }

  sendNotification(userId: string, data = 'hello!') {
    const room = this.getUserRoom(userId);
    this.io.to(room).emit('notification', { data });
    this.logger.debug(`Notification sent to room: ${room}`);
  }

  async handleConnection(client: Socket) {
    const authorization = client.handshake.headers.authorization;
    const [type, token] = authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      this.logger.warn(
        `Client id: ${client.id} rejected (missing/invalid Authorization header)`,
      );
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: number }>(token);
      const room = this.getUserRoom(String(payload.sub));
      console.log(payload);
      await client.join(room);
      this.logger.log(
        `Client id: ${client.id} connected and joined room: ${room}`,
      );
    } catch {
      this.logger.warn(`Client id: ${client.id} rejected (invalid JWT)`);
      client.disconnect(true);
      return;
    }

    this.logger.debug(
      `Number of connected clients: ${this.io.sockets.sockets.size}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handleMessage(client: Socket, data: string) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
    return {
      event: 'pong',
      data,
    };
  }

  private getUserRoom(userId: string): string {
    return `user:${userId}`;
  }
}
