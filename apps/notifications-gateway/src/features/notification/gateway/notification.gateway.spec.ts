import type { TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { NotificationGateway } from './notification.gateway';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let jwtService: { verifyAsync: jest.Mock };

  beforeEach(async () => {
    jwtService = {
      verifyAsync: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
    (
      gateway as unknown as {
        io: { sockets: { sockets: Map<string, string> } };
      }
    ).io = {
      sockets: {
        sockets: new Map(),
      },
    };
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('accepts socket auth token from handshake.auth.token', async () => {
    jwtService.verifyAsync.mockResolvedValueOnce({ sub: 17 });
    const join = jest.fn().mockResolvedValue(undefined);
    const disconnect = jest.fn();

    const socket = {
      id: 'socket-1',
      handshake: {
        auth: { token: 'jwt-token' },
        headers: {},
      },
      join,
      disconnect,
    } as unknown as Socket;

    await gateway.handleConnection(socket);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('jwt-token');
    expect(join).toHaveBeenCalledWith('user:17');
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('disconnects client when token is missing', async () => {
    const disconnect = jest.fn();
    const socket = {
      id: 'socket-2',
      handshake: {
        auth: {},
        headers: {},
      },
      join: jest.fn(),
      disconnect,
    } as unknown as Socket;

    await gateway.handleConnection(socket);

    expect(disconnect).toHaveBeenCalledWith(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });
});
