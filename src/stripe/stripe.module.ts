import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { createStripeClient } from '../config/stripe.config';

@Module({
  providers: [
    {
      provide: Stripe,
      useFactory: (configService: ConfigService) =>
        createStripeClient(configService),
      inject: [ConfigService],
    },
  ],
  exports: [Stripe],
})
export class StripeModule {}
