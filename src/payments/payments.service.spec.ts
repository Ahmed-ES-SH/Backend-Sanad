import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { Payment } from './schema/payment.schema';
import { PaymentStatus } from './enums/payment-status.enum';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

type MockRepo = Partial<Record<keyof Repository<Payment>, jest.Mock>>;

const buildService = (webhookSecret = 'whsec_test_secret') => {
  const paymentRepository: MockRepo = {
    create: jest.fn((payload: Partial<Payment>) => payload),
    save: jest.fn(async (payload: Partial<Payment>) => ({
      id: 'payment_1',
      ...payload,
    })),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const stripe = {
    paymentIntents: {
      create: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  } as unknown as Stripe;

  const configService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'STRIPE_WEBHOOK_SECRET') return webhookSecret;
      if (key === 'STRIPE_SECRET_KEY') return 'sk_test_123';
      throw new Error(`Unexpected key: ${key}`);
    }),
  } as unknown as ConfigService;

  const eventEmitter = {
    emit: jest.fn(),
  } as unknown as EventEmitter2;

  const service = new PaymentsService(
    paymentRepository as unknown as Repository<Payment>,
    stripe,
    configService,
    eventEmitter,
  );

  return {
    service,
    paymentRepository,
    stripe,
    eventEmitter,
  };
};

describe('PaymentsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses deterministic idempotency key for repeated createPaymentIntent requests', async () => {
    const { service, stripe } = buildService();
    const dto: CreatePaymentIntentDto = {
      amount: 100,
      currency: 'usd',
      description: 'Test Payment',
      userId: 10,
    };

    (stripe.paymentIntents.create as jest.Mock)
      .mockResolvedValueOnce({
        id: 'pi_1',
        client_secret: 'secret_1',
        customer: null,
      })
      .mockResolvedValueOnce({
        id: 'pi_2',
        client_secret: 'secret_2',
        customer: null,
      });

    await service.createPaymentIntent(dto);
    await service.createPaymentIntent(dto);

    const firstKey = (stripe.paymentIntents.create as jest.Mock).mock
      .calls[0][1].idempotencyKey;
    const secondKey = (stripe.paymentIntents.create as jest.Mock).mock
      .calls[1][1].idempotencyKey;

    expect(firstKey).toEqual(secondKey);
  });

  it('does not regress SUCCEEDED payment back to FAILED from webhook', async () => {
    const { service, paymentRepository } = buildService();

    (paymentRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'payment_1',
      stripePaymentIntentId: 'pi_1',
      status: PaymentStatus.SUCCEEDED,
      userId: 10,
      amount: 100,
      metadata: null,
    });

    await service.handleWebhookEvent({
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_1',
          last_payment_error: { message: 'declined' },
        },
      },
    } as unknown as Stripe.Event);

    expect(paymentRepository.save).not.toHaveBeenCalled();
  });

  it('marks charge.refunded as PARTIALLY_REFUNDED for partial amounts', async () => {
    const { service, paymentRepository } = buildService();

    (paymentRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'payment_1',
      stripePaymentIntentId: 'pi_1',
      status: PaymentStatus.SUCCEEDED,
      userId: 10,
      amount: 100,
      metadata: null,
    });

    await service.handleWebhookEvent({
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_1',
          payment_intent: 'pi_1',
          amount: 10000,
          amount_refunded: 2500,
        },
      },
    } as unknown as Stripe.Event);

    const savedPayment = (paymentRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedPayment.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
    expect(savedPayment.metadata.refundType).toBe('partial');
    expect(savedPayment.metadata.refundedAmount).toBe(25);
    expect(savedPayment.metadata.originalAmount).toBe(100);
  });

  it('marks charge.refunded as REFUNDED for full amounts', async () => {
    const { service, paymentRepository } = buildService();

    (paymentRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'payment_1',
      stripePaymentIntentId: 'pi_1',
      status: PaymentStatus.SUCCEEDED,
      userId: 10,
      amount: 100,
      metadata: null,
    });

    await service.handleWebhookEvent({
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_2',
          payment_intent: 'pi_1',
          amount: 10000,
          amount_refunded: 10000,
        },
      },
    } as unknown as Stripe.Event);

    const savedPayment = (paymentRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedPayment.status).toBe(PaymentStatus.REFUNDED);
    expect(savedPayment.metadata.refundType).toBe('full');
  });

  it('fails fast when webhook secret is invalid', () => {
    expect(() => buildService('invalid_secret')).toThrow(
      'Invalid STRIPE_WEBHOOK_SECRET format',
    );
  });

  it('returns existing unfinished payment when save hits duplicate stripe intent id', async () => {
    const { service, stripe, paymentRepository } = buildService();
    const dto: CreatePaymentIntentDto = {
      amount: 100,
      currency: 'usd',
      description: 'Test Payment',
      userId: 10,
    };

    (stripe.paymentIntents.create as jest.Mock).mockResolvedValue({
      id: 'pi_1',
      client_secret: 'secret_1',
      customer: null,
    });

    (paymentRepository.save as jest.Mock).mockRejectedValue({
      code: '23505',
      constraint: 'UQ_94c6e6376625bc6710d7dbb4b6b',
    });

    (paymentRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'payment_existing',
      stripePaymentIntentId: 'pi_1',
      status: PaymentStatus.PENDING,
    });

    await expect(service.createPaymentIntent(dto)).resolves.toEqual({
      clientSecret: 'secret_1',
      paymentId: 'payment_existing',
      stripePaymentIntentId: 'pi_1',
    });
  });
});
