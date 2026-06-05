/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ForbiddenException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { WebSocketData } from '../config/ws.config';
import { AuthService } from '../auth/auth.service';

export enum WsEvent {
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_READ_ALL = 'notification:read_all',
  NOTIFICATION_COUNT = 'notification:count',
  NOTIFICATION_DELETE = 'notification:delete',
}

export interface ClientToServerEvents {
  [WsEvent.NOTIFICATION_READ]: (payload: { notificationId: string }) => void;
  [WsEvent.NOTIFICATION_READ_ALL]: () => void;
}

export interface ServerToClientEvents {
  [WsEvent.NOTIFICATION_NEW]: (payload: unknown) => void;
  [WsEvent.NOTIFICATION_READ]: (payload: { notificationId: string }) => void;
  [WsEvent.NOTIFICATION_READ_ALL]: () => void;
  [WsEvent.NOTIFICATION_COUNT]: (payload: { unreadCount: number }) => void;
  [WsEvent.NOTIFICATION_DELETE]: (payload: { notificationId: string }) => void;
}

export interface InterServerEvents {}

export type TypedWsServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  WebSocketData
>;

export type TypedWsSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  WebSocketData
>;

@WebSocketGateway()
@UseGuards(WsJwtGuard)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: TypedWsServer;

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: TypedWsSocket): Promise<void> {
    try {
      const authData = await this.authenticateClient(client);
      client.data = authData;

      // Join user to their personal room for direct notifications
      await client.join(`user:${authData.userId}`);
      console.log(`Client connected: ${client.id} - User: ${authData.userId}`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: TypedWsSocket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Emit to specific user
  emitToUser(userId: number | string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(WsEvent.NOTIFICATION_NEW, payload);
  }

  // Emit read update to specific user
  emitReadUpdate(userId: number, notificationId: string): void {
    this.server.to(`user:${userId}`).emit(WsEvent.NOTIFICATION_READ, {
      notificationId,
    });
  }

  // Emit read all update to specific user
  emitReadAllUpdate(userId: number): void {
    this.server.to(`user:${userId}`).emit(WsEvent.NOTIFICATION_READ_ALL);
  }

  // Emit unread count update to specific user
  emitCountUpdate(userId: number, unreadCount: number): void {
    this.server.to(`user:${userId}`).emit(WsEvent.NOTIFICATION_COUNT, {
      unreadCount,
    });
  }

  // Emit delete update to specific user
  emitDelete(userId: number, notificationId: string): void {
    this.server.to(`user:${userId}`).emit(WsEvent.NOTIFICATION_DELETE, {
      notificationId,
    });
  }

  // Broadcast to all connected clients
  broadcast(payload: unknown): void {
    this.server.emit(WsEvent.NOTIFICATION_NEW, payload);
  }

  // Handle client marking a notification as read
  @SubscribeMessage(WsEvent.NOTIFICATION_READ)
  handleMarkRead(
    @ConnectedSocket() client: TypedWsSocket,
    @MessageBody() payload: { notificationId: string },
  ): void {
    // This is handled by the REST API, but we can add WebSocket support here if needed
    console.log(
      `User ${client.data.userId} marked notification ${payload.notificationId} as read via WebSocket`,
    );
  }

  // Handle client marking all notifications as read
  @SubscribeMessage(WsEvent.NOTIFICATION_READ_ALL)
  handleMarkAllRead(@ConnectedSocket() client: TypedWsSocket): void {
    // This is handled by the REST API, but we can add WebSocket support here if needed
    console.log(
      `User ${client.data.userId} marked all notifications as read via WebSocket`,
    );
  }

  private async authenticateClient(
    client: TypedWsSocket,
  ): Promise<WebSocketData> {
    const token = this.extractToken(client);
    if (!token) {
      throw new UnauthorizedException('WebSocket token not provided');
    }

    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new ForbiddenException('Token has been revoked');
    }

    try {
      const payload = this.jwtService.verify<{
        sub?: string | number;
        id?: string | number;
        name?: string;
        email?: string;
      }>(token);

      const userId = String(payload.sub ?? payload.id ?? '');
      if (!userId) {
        throw new UnauthorizedException('Invalid WebSocket token payload');
      }

      return {
        userId,
        userName: payload.name ?? payload.email ?? 'Unknown',
      };
    } catch {
      throw new UnauthorizedException('Invalid WebSocket token');
    }
  }

  private extractToken(client: TypedWsSocket): string | undefined {
    const cookieName = 'sanad_auth_token';

    const cookieHeader = client.handshake.headers.cookie;
    if (cookieHeader) {
      const token = cookieHeader
        .split(';')
        .map((part: any) => part.trim())
        .find((part: any) => part.startsWith(`${cookieName}=`))
        ?.split('=')
        .slice(1)
        .join('=');

      if (token) {
        return decodeURIComponent(token);
      }
    }

    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string') {
      return authToken;
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (authorization) {
      const [type, token] = authorization.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return undefined;
  }
}
