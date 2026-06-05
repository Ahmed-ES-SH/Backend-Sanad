import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  ParseUUIDPipe,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreatePaymentIntentResponseDto } from './dto/create-payment-intent-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { GetUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/schema/user.schema';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsClientController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /payments/create-intent
   *
   * Create a Stripe PaymentIntent for the existing custom payment flow.
   * This endpoint returns a `clientSecret` used by Stripe.js for confirmation.
   *
   * Recommendation for new integrations:
   * - Prefer Checkout Sessions or Payment Element-backed Checkout Sessions.
   * - Keep this PaymentIntent endpoint for backward compatibility/custom flows.
   *
   * Authentication: Any authenticated user (any role)
   *
   * Request Body (CreatePaymentIntentDto):
   * - amount (number, required): Amount in dollars (NOT cents), min 0.50, max 2 decimal places
   *   Example: 50.00 for fifty dollars
   * - currency (string, optional): ISO 4217 currency code, default 'usd', max 10 chars
   *   Example: 'usd', 'eur', 'gbp'
   * - description (string, required): Description of the payment
   *   Example: 'Web Development Consultation'
   * - userId (number, optional): Numeric user ID to associate with the payment
   *   Example: 123
   *
   * Example Request:
   * POST /payments/create-intent
   * Headers: {
   *   Authorization: 'Bearer <user_token>',
   *   Content-Type: 'application/json'
   * }
   * Body: {
   *   "amount": 50.00,
   *   "currency": "usd",
   *   "description": "Web Development Consultation"
   * }
   *
   * Example Success Response (201 Created):
   * {
   *   "clientSecret": "pi_3N5xYz2eZvKYlo2C0bXcQpRt_secret_xxxxxxxxxxxxxxxxxxxxxxxx",
   *   "paymentId": "550e8400-e29b-41d4-a716-446655440000",
   *   "stripePaymentIntentId": "pi_3N5xYz2eZvKYlo2C0bXcQpRt"
   * }
   *
   * Current Frontend Flow (legacy custom flow):
   * 1. Call this endpoint with payment details to get `clientSecret`
   * 2. Confirm payment with Stripe.js using the returned `clientSecret`
   * 3. Stripe processes the payment and sends the result to the backend webhook
   * 4. The webhook updates the payment status automatically (no frontend action needed)
   * 5. Optionally poll or listen for payment status updates on the frontend
   *
   * Error Responses:
   * - 400 Bad Request: Invalid input (e.g., amount < 0.50, invalid currency, missing description)
   * - 401 Unauthorized: Missing or invalid authentication token
   * - 502 Bad Gateway: Stripe API error (e.g., invalid API key, network issue)
   */
  @Post('create-intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiBody({
    type: CreatePaymentIntentDto,
    examples: {
      standard: {
        summary: 'Standard payment',
        value: {
          amount: 50.0,
          currency: 'usd',
          description: 'Web Development Consultation',
        },
      },
      withUserId: {
        summary: 'Payment with user association',
        value: {
          amount: 100.0,
          currency: 'eur',
          description: 'Premium Package Upgrade',
          userId: 123,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    type: CreatePaymentIntentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @ApiResponse({
    status: 502,
    description: 'Stripe API error',
  })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<CreatePaymentIntentResponseDto> {
    return this.paymentsService.createPaymentIntent(dto);
  }

  /**
   * Get a single payment by ID
   * @param id Payment UUID
   * @returns Payment details
   * endpoint : GET /api/payments/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single payment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Payment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  /**
   * GET /api/payments
   * List all payments with filters and pagination.
   * Authentication: Any authenticated user (any role)
   * Example Request:
   * GET /api/payments?page=1&limit=10&status=succeeded&startDate=2026-01-01
   * Error Responses:
   * - 401 Unauthorized: Missing or invalid authentication token
   * - 403 Forbidden: Insufficient permissions (not ADMIN role)
   */
  @Get()
  @ApiOperation({ summary: 'List all payments with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: String,
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'partially_refunded', 'refunded'],
  })
  @ApiQuery({ name: 'userId', required: false, type: Number, example: 123 })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2026-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of payments',
    type: PaymentResponseDto,
    isArray: true,
  })
  async findUserHistory(
    @Query() query: PaymentFilterDto,
    @GetUser() user: User,
  ): Promise<{
    data: PaymentResponseDto[];
    meta: {
      page: number;
      limit: number;
      total: number;
      lastPage: number;
      perPage: number;
    };
  }> {
    return this.paymentsService.findUserHistory(query, user.id);
  }
}
