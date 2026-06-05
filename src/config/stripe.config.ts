import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const STRIPE_API_VERSION = '2026-04-22.dahlia' as const;

export const createStripeClient = (configService: ConfigService): Stripe => {
  const secretKey = configService.getOrThrow<string>('STRIPE_SECRET_KEY');
  const hasValidPrefix =
    secretKey.startsWith('sk_') || secretKey.startsWith('rk_');

  if (!hasValidPrefix) {
    throw new Error(
      'Invalid STRIPE_SECRET_KEY format. Expected key starting with "sk_" or "rk_".',
    );
  }

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
  });
};
