/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  BadGatewayException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import Stripe from 'stripe';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment } from './schema/payment.schema';
import { PaymentStatus } from './enums/payment-status.enum';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { RefundResponseDto } from './dto/refund-response.dto';
import { NOTIFICATION_EVENTS } from '../notifications/events/notification.events';
import { PaginationMetaDto } from '../DTO/pagination.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly webhookSecret: string;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!this.webhookSecret.startsWith('whsec_')) {
      throw new Error(
        'Invalid STRIPE_WEBHOOK_SECRET format. Expected secret starting with "whsec_".',
      );
    }
  }

  private toCents(dollars: number): number {
    return Math.round(dollars * 100);
  }

  private toDollars(cents: number): number {
    return cents / 100;
  }

  private buildCreateIntentIdempotencyKey(dto: CreatePaymentIntentDto): string {
    const fingerprintPayload = JSON.stringify({
      amount: this.toCents(dto.amount),
      currency: (dto.currency ?? 'usd').toLowerCase(),
      description: dto.description.trim(),
      userId: dto.userId ?? null,
    });

    const fingerprint = createHash('sha256')
      .update(fingerprintPayload)
      .digest('hex')
      .slice(0, 32);

    return `create_intent:${fingerprint}`;
  }

  private canTransitionTo(
    current: PaymentStatus,
    next: PaymentStatus,
  ): boolean {
    if (current === next) return true;

    if (current === PaymentStatus.REFUNDED) return false;
    if (
      next === PaymentStatus.FAILED &&
      (current === PaymentStatus.SUCCEEDED ||
        current === PaymentStatus.PARTIALLY_REFUNDED)
    ) {
      return false;
    }

    if (
      next === PaymentStatus.SUCCEEDED &&
      current === PaymentStatus.PARTIALLY_REFUNDED
    ) {
      return false;
    }

    return true;
  }

  private isCreateIntentDuplicateError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const dbError = error as { code?: string; constraint?: string };
    return (
      dbError.code === '23505' &&
      dbError.constraint === 'UQ_94c6e6376625bc6710d7dbb4b6b'
    );
  }

  private isUnfinishedPayment(status: PaymentStatus): boolean {
    return status === PaymentStatus.PENDING;
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<{
    clientSecret: string;
    paymentId: string;
    stripePaymentIntentId: string;
  }> {
    let paymentIntent: Stripe.PaymentIntent;

    try {
      paymentIntent = await this.stripe.paymentIntents.create({
        amount: this.toCents(dto.amount),
        currency: dto.currency ?? 'usd',
        description: dto.description,
        metadata: {
          userId: dto.userId?.toString() ?? 'guest',
          ...(dto.orderId ? { orderId: dto.orderId } : {}),
          ...(dto.serviceId ? { serviceId: dto.serviceId } : {}),
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Stripe PaymentIntent creation failed: ${message}`);
      throw new BadGatewayException(
        'Payment gateway temporarily unavailable. Please try again.',
      );
    }

    const payment = this.paymentRepository.create({
      userId: dto.userId ?? null,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer as string | null,
      amount: dto.amount,
      currency: dto.currency ?? 'usd',
      description: dto.description,
      status: PaymentStatus.PENDING,
    });

    try {
      const savedPayment = await this.paymentRepository.save(payment);

      return {
        clientSecret: paymentIntent.client_secret as string,
        paymentId: savedPayment.id,
        stripePaymentIntentId: paymentIntent.id,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Database saving failed: ${error instanceof Error ? error.message : ''}`,
      );
      throw error;
    }
  }

  verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.warn(`Stripe webhook verification failed: ${message}`);
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const stripeEvent = event.data.object as
      | Stripe.PaymentIntent
      | Stripe.Charge;

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(
          stripeEvent as Stripe.PaymentIntent,
        );
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(
          stripeEvent as Stripe.PaymentIntent,
        );
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(stripeEvent as Stripe.Charge);
        break;

      default:
        this.logger.debug(
          `Ignored unsupported Stripe event type: ${event.type}`,
        );
        break;
    }
  }

  private async handlePaymentIntentSucceeded(
    intent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: intent.id },
    });

    if (!payment) {
      this.logger.warn(
        `Payment not found for Stripe intent: ${intent.id}. Skipping.`,
      );
      return;
    }

    if (
      !this.canTransitionTo(payment.status, PaymentStatus.SUCCEEDED) ||
      payment.status === PaymentStatus.SUCCEEDED
    ) {
      this.logger.debug(
        `Payment ${payment.id} cannot transition from ${payment.status} to SUCCEEDED. Idempotent skip.`,
      );
      return;
    }

    payment.status = PaymentStatus.SUCCEEDED;
    payment.metadata = intent.metadata as Record<string, unknown> | null;
    await this.paymentRepository.save(payment);

    // Emit event for ServiceOrders module to handle
    const orderId = (intent.metadata as Record<string, unknown> | null)
      ?.orderId as string | undefined;
    const serviceId = (intent.metadata as Record<string, unknown> | null)
      ?.serviceId as string | undefined;

    this.eventEmitter.emit('payment.succeeded', {
      orderId,
      serviceId,
      userId: payment.userId,
      paymentId: payment.id,
      amount: payment.amount,
    });

    this.logger.log(`Payment ${payment.id} updated to SUCCEEDED via webhook`);

    // Emit notification event
    if (payment.userId) {
      this.eventEmitter.emit(NOTIFICATION_EVENTS.PAYMENT_SUCCESS, {
        userId: payment.userId,
        paymentId: payment.id,
        amount: payment.amount,
        title: 'Payment Successful',
        message: `Your payment of $${payment.amount} has been processed successfully.`,
      });
    }
  }

  private async handlePaymentIntentFailed(
    intent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: intent.id },
    });

    if (!payment) {
      this.logger.warn(
        `Payment not found for Stripe intent: ${intent.id}. Skipping.`,
      );
      return;
    }

    if (
      !this.canTransitionTo(payment.status, PaymentStatus.FAILED) ||
      payment.status === PaymentStatus.FAILED
    ) {
      this.logger.debug(
        `Payment ${payment.id} cannot transition from ${payment.status} to FAILED. Idempotent skip.`,
      );
      return;
    }

    payment.status = PaymentStatus.FAILED;
    await this.paymentRepository.save(payment);

    this.logger.log(`Payment ${payment.id} updated to FAILED via webhook`);

    // Emit notification event
    if (payment.userId) {
      const failureReason =
        intent.last_payment_error?.message || 'Unknown error';
      this.eventEmitter.emit(NOTIFICATION_EVENTS.PAYMENT_FAILED, {
        userId: payment.userId,
        paymentId: payment.id,
        amount: payment.amount,
        reason: failureReason,
        title: 'Payment Failed',
        message: `Your payment of $${payment.amount} failed. Reason: ${failureReason}`,
      });
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) {
      this.logger.warn(
        `Charge ${charge.id} has no payment_intent ID. Skipping.`,
      );
      return;
    }

    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      this.logger.warn(
        `Payment not found for Stripe intent: ${paymentIntentId}. Skipping.`,
      );
      return;
    }

    if (
      !this.canTransitionTo(payment.status, PaymentStatus.REFUNDED) ||
      payment.status === PaymentStatus.REFUNDED
    ) {
      this.logger.debug(
        `Payment ${payment.id} cannot transition from ${payment.status} to REFUNDED. Idempotent skip.`,
      );
      return;
    }

    const isPartiallyRefunded =
      charge.amount_refunded > 0 && charge.amount_refunded < charge.amount;

    payment.status = isPartiallyRefunded
      ? PaymentStatus.PARTIALLY_REFUNDED
      : PaymentStatus.REFUNDED;
    payment.metadata = {
      ...(payment.metadata ?? {}),
      refundId: charge.id,
      refundedAmount: this.toDollars(charge.amount_refunded),
      originalAmount: this.toDollars(charge.amount),
      refundType: isPartiallyRefunded ? 'partial' : 'full',
      refundedAt: new Date().toISOString(),
    };
    await this.paymentRepository.save(payment);

    this.logger.log(
      `Payment ${payment.id} updated to ${payment.status.toUpperCase()} via webhook`,
    );
  }

  private toResponseDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      userId: payment.userId,
      user: payment.user
        ? {
            id: payment.user.id,
            name: payment.user.name,
            email: payment.user.email,
            avatar: payment.user.avatar,
          }
        : null,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      stripeCustomerId: payment.stripeCustomerId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private async findOneOrFail(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }
    return payment;
  }

  async findAll(query: PaymentFilterDto): Promise<{
    data: PaymentResponseDto[];
    meta: PaginationMetaDto;
  }> {
    const {
      page = 1,
      limit = 10,
      order = 'DESC',
      sortBy = 'createdAt',
    } = query;
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      const start = query.startDate
        ? new Date(query.startDate)
        : new Date('1970-01-01');
      const end = query.endDate ? new Date(query.endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      where.createdAt = Between(start, end);
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ['user'],
      order: { [sortBy]: order } as Record<string, 'ASC' | 'DESC'>,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((p) => this.toResponseDto(p)),
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  async findOne(id: string): Promise<PaymentResponseDto> {
    const payment = await this.findOneOrFail(id);
    return this.toResponseDto(payment);
  }

  async refund(id: string): Promise<RefundResponseDto> {
    const payment = await this.findOneOrFail(id);

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException(
        `Cannot refund: payment status is '${payment.status}'. Only succeeded payments can be refunded.`,
      );
    }

    try {
      await this.stripe.refunds.create(
        { payment_intent: payment.stripePaymentIntentId },
        {
          idempotencyKey: `refund:${payment.id}`,
        },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Stripe refund failed for payment ${payment.id}: ${message}`,
      );
      throw new BadGatewayException(
        'Refund failed at payment gateway. Payment status unchanged.',
      );
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.metadata = {
      ...(payment.metadata ?? {}),
      adminRefundedAt: new Date().toISOString(),
    };
    await this.paymentRepository.save(payment);

    return {
      id: payment.id,
      status: payment.status,
      message: 'Payment refunded successfully',
    };
  }

  async findUserHistory(
    query: PaymentFilterDto,
    userId: number,
  ): Promise<{
    data: PaymentResponseDto[];
    meta: PaginationMetaDto;
  }> {
    const {
      page = 1,
      limit = 10,
      order = 'DESC',
      sortBy = 'createdAt',
    } = query;

    const where: Record<string, unknown> = {
      userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      const start = query.startDate
        ? new Date(query.startDate)
        : new Date('1970-01-01');

      const end = query.endDate ? new Date(query.endDate) : new Date();

      end.setHours(23, 59, 59, 999);

      where.createdAt = Between(start, end);
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ['user'],
      order: {
        [sortBy]: order,
      } as Record<string, 'ASC' | 'DESC'>,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((payment) => this.toResponseDto(payment)),
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  async getPaymentsStats() {
    const [total, succeeded, pending, refunded, failed, partiallyRefunded] =
      await Promise.all([
        this.paymentRepository.count(),
        this.paymentRepository.count({
          where: { status: PaymentStatus.SUCCEEDED },
        }),
        this.paymentRepository.count({
          where: { status: PaymentStatus.PENDING },
        }),
        this.paymentRepository.count({
          where: { status: PaymentStatus.REFUNDED },
        }),
        this.paymentRepository.count({
          where: { status: PaymentStatus.FAILED },
        }),
        this.paymentRepository.count({
          where: { status: PaymentStatus.PARTIALLY_REFUNDED },
        }),
      ]);

    return {
      total,
      succeeded,
      pending,
      refunded,
      failed,
      partiallyRefunded,
    };
  }
}
