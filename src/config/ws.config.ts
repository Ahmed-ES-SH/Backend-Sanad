/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import type { ServerOptions } from 'socket.io';
import type { Server, Socket } from 'socket.io';

export interface WebSocketData {
  userId: string;
  userName: string;
}

// Use default Socket.IO adapter (in-memory)
// WebSocket gateway works on the same application port without external adapters
export class SanadIoAdapter extends IoAdapter {
  constructor(app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void,
        ) => {
          const allowedOrigin =
            process.env.FRONTEND_URL ?? 'https://sanad-omega.vercel.app';
          // Allow server-to-server and matching origin
          if (!origin || origin === allowedOrigin) {
            callback(null, true);
          } else {
            callback(new Error(`WS CORS: Origin ${origin} not allowed`));
          }
        },
        credentials: true,
      },
      transports: ['websocket', 'polling'], // polling needed for Vercel
    });
  }
}

// Typed server and socket for use throughout the application
export type TypedIoServer = Server<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>,
  WebSocketData
>;

export type TypedIoSocket = Socket<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>,
  WebSocketData
>;
