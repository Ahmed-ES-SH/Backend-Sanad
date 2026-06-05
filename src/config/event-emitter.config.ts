import { EventEmitterModuleOptions } from '@nestjs/event-emitter/dist/interfaces';
import { ConfigService } from '@nestjs/config';

export const createEventEmitterConfig = (
  configService: ConfigService,
): EventEmitterModuleOptions => ({
  wildcard: true,
  delimiter: '.',
  maxListeners: 100,
  ignoreErrors: false,
});
