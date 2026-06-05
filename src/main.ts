/* eslint-disable @typescript-eslint/no-unsafe-call */
/////////////////////////////////////////////////////////////////////////////////////
////////////////////// for local development
/////////////////////////////////////////////////////////////////////////////////////

// import { NestFactory } from '@nestjs/core';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { AppModule } from './app.module';
// import helmet from 'helmet';
// import { ValidationPipe } from '@nestjs/common';
// import cookieParser from 'cookie-parser';
// import { SanadIoAdapter } from './config/ws.config';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, { rawBody: true });

//   app.use(cookieParser());

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//     }),
//   );

//   app.use(helmet());

//   app.enableCors({
//     origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
//     credentials: true,
//   });

//   // Attach custom Socket.IO adapter (in-memory)
//   app.useWebSocketAdapter(new SanadIoAdapter(app));

//   const config = new DocumentBuilder()
//     .setTitle('Cats example')
//     .setDescription('The cats API description')
//     .setVersion('1.0')
//     .addTag('cats')
//     .build();
//   const documentFactory = () => SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api', app, documentFactory);

//   app.setGlobalPrefix('api');

//   await app.listen(process.env.PORT ?? '5000');

//   app.useLogger(['error', 'warn']); // production
// }
// bootstrap();

///////////////////////////////////////////////////////////////////////////////////
//////////////////// to work on vercel
///////////////////////////////////////////////////////////////////////////////////

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { SanadIoAdapter } from './config/ws.config';

const server = express();
let isInitialized = false;

export const createNestServer = async (expressInstance: any) => {
  if (isInitialized) return;
  isInitialized = true;

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    { rawBody: true },
  );

  // Attach custom Socket.IO adapter (in-memory)
  app.useWebSocketAdapter(new SanadIoAdapter(app));

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(helmet());
  app.enableCors({
    origin: (origin: any, callback: any) => {
      const allowedOrigin =
        process.env.FRONTEND_URL ?? 'https://sanad-tau-six.vercel.app';
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.setGlobalPrefix('api');

  await app.init();
};

export default async (req: any, res: any) => {
  await createNestServer(server);
  server(req, res);
};
