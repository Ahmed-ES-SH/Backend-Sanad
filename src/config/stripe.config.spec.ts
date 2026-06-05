import { ConfigService } from '@nestjs/config';
import { createStripeClient } from './stripe.config';

describe('createStripeClient', () => {
  it('throws when STRIPE_SECRET_KEY does not start with sk_ or rk_', () => {
    const configService = {
      getOrThrow: jest.fn(() => 'pk_test_invalid'),
    } as unknown as ConfigService;

    expect(() => createStripeClient(configService)).toThrow(
      'Invalid STRIPE_SECRET_KEY format',
    );
  });

  it('creates client for sk_ keys', () => {
    const configService = {
      getOrThrow: jest.fn(() => 'sk_test_valid'),
    } as unknown as ConfigService;

    expect(() => createStripeClient(configService)).not.toThrow();
  });

  it('creates client for rk_ keys', () => {
    const configService = {
      getOrThrow: jest.fn(() => 'rk_test_valid'),
    } as unknown as ConfigService;

    expect(() => createStripeClient(configService)).not.toThrow();
  });
});
