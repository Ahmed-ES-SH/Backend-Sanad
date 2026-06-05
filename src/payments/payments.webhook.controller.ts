import {
  BadRequestException,
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { Public } from '../auth/decorators/public.decorator';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@ApiTags('Stripe Webhooks')
@Public()
@Controller('stripe')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/stripe/webhook
   *
   * Handle Stripe webhook events.
   * This endpoint is called by Stripe, NOT by the frontend or any client application.
   * It receives asynchronous events from Stripe and updates payment statuses accordingly.
   *
   * Authentication: None (public endpoint, but requires valid Stripe signature)
   *
   * Required Headers:
   * - stripe-signature (string, required): Stripe webhook signature for verifying event authenticity
   * - Content-Type: application/json
   *
   * Handled Stripe Events:
   * 1. payment_intent.succeeded
   *    - Updates payment status to 'SUCCEEDED'
   *    - Triggered when a payment is successfully processed
   *
   * 2. payment_intent.payment_failed
   *    - Updates payment status to 'FAILED'
   *    - Triggered when a payment attempt fails (e.g., insufficient funds, card declined)
   *
   * 3. charge.refunded
   *    - Updates payment status to 'REFUNDED'
   *    - Triggered when a refund is processed through Stripe
   *
   * Example Stripe Webhook Payload (payment_intent.succeeded):
   * {
   *   "id": "evt_1N5xYz2eZvKYlo2C0bXcQpRt",
   *   "object": "event",
   *   "type": "payment_intent.succeeded",
   *   "data": {
   *     "object": {
   *       "id": "pi_3N5xYz2eZvKYlo2C0bXcQpRt",
   *       "object": "payment_intent",
   *       "amount": 5000,
   *       "currency": "usd",
   *       "status": "succeeded",
   *       "customer": "cus_O1aB2cD3eF4gH5"
   *     }
   *   }
   * }
   *
   * Example Success Response (200 OK):
   * {
   *   "received": true
   * }
   *
   * Error Responses:
   * - 400 Bad Request: Missing or invalid Stripe signature, or missing raw body
   *
   * Important Notes for Frontend Developers:
   * - This endpoint is NOT called by the frontend application
   * - Stripe calls this endpoint asynchronously after payment events
   * - Payment status changes are webhook-driven; after confirming a payment with Stripe.js,
   *   the frontend may need to poll or use WebSocket to get real-time status updates
   * - The endpoint uses idempotency to prevent duplicate processing of the same event
   * - Server must be bootstrapped with Nest `rawBody: true` for signature verification
   */
  @Post('webhook')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature for signature verification',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook received successfully',
    schema: {
      example: { received: true },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or missing raw body',
  })
  async handleWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature?: string,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      this.logger.warn('Webhook rejected: missing stripe-signature header');
      throw new BadRequestException('Invalid webhook signature');
    }

    if (!req.rawBody) {
      this.logger.warn('Webhook rejected: missing raw body');
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = this.paymentsService.verifyWebhookSignature(
      req.rawBody,
      signature,
    );

    await this.paymentsService.handleWebhookEvent(event);

    return { received: true };
  }
}
