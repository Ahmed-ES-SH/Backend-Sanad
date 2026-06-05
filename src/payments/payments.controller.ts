import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { RefundResponseDto } from './dto/refund-response.dto';
import { Roles } from '../auth/decorators/Roles.decorator';
import { UserRoleEnum } from '../auth/types/UserRoleEnum';
import { PaymentStatisticsResponseDto } from './dto/payment-statistics-response.dto';
import { PaginationMetaDto } from 'src/DTO/pagination.dto';

@ApiTags('Payments (Admin)')
@ApiBearerAuth()
@Roles(UserRoleEnum.ADMIN)
@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * GET /admin/payments
   *
   * List all payments with filters and pagination.
   *
   * Authentication: ADMIN role required
   *
   * Query Parameters:
   * - page (number, default: 1): Page number, min 1
   * - limit (number, default: 10): Items per page, range 1-100
   * - sortBy (string, default: 'createdAt'): Field to sort by
   * - order (string, default: 'DESC'): Sort order, 'ASC' or 'DESC'
   * - status (string, optional): Filter by status - 'pending', 'succeeded', 'failed', 'partially_refunded', 'refunded'
   * - userId (number, optional): Filter by numeric user ID
   * - startDate (string, optional): Filter from date (ISO 8601, e.g., '2026-01-01')
   * - endDate (string, optional): Filter until date (ISO 8601, e.g., '2026-12-31')
   *
   * Example Request:
   * GET /admin/payments?page=1&limit=10&status=succeeded&startDate=2026-01-01
   * Headers: { Authorization: 'Bearer <admin_token>' }
   *
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
  async findAll(@Query() query: PaymentFilterDto): Promise<{
    data: PaymentResponseDto[];
    meta: PaginationMetaDto;
  }> {
    return this.paymentsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics',
    type: PaymentStatisticsResponseDto,
  })
  async getPaymentStatistics(): Promise<PaymentStatisticsResponseDto> {
    return this.paymentsService.getPaymentsStats();
  }

  /**
   * GET /admin/payments/:id
   *
   * Get detailed information about a specific payment.
   *
   * Authentication: ADMIN role required
   *
   * Path Parameters:
   * - id (string, required): Payment UUID
   *
   * Error Responses:
   * - 401 Unauthorized: Missing or invalid authentication token
   * - 403 Forbidden: Insufficient permissions (not ADMIN role)
   * - 404 Not Found: Payment with the specified ID does not exist
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
   * POST /admin/payments/:id/refund
   *
   * Refund a payment that has status 'succeeded'.
   * Only payments in 'succeeded' status can be refunded.
   * The refund is processed through Stripe and is idempotent.
   *
   * Authentication: ADMIN role required
   *
   * Path Parameters:
   * - id (string, required): Payment UUID to refund
   *
   * Example Request:
   * POST /admin/payments/550e8400-e29b-41d4-a716-446655440000/refund
   * Headers: { Authorization: 'Bearer <admin_token>' }
   * Body: (empty)
   *
   * Error Responses:
   * - 400 Bad Request: Payment cannot be refunded (status is not 'succeeded')
   * - 401 Unauthorized: Missing or invalid authentication token
   * - 403 Forbidden: Insufficient permissions (not ADMIN role)
   * - 404 Not Found: Payment with the specified ID does not exist
   * - 502 Bad Gateway: Stripe API error during refund (payment status remains unchanged)
   */
  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a succeeded payment' })
  @ApiParam({
    name: 'id',
    description: 'Payment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully',
    type: RefundResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Payment cannot be refunded',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async refund(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RefundResponseDto> {
    return this.paymentsService.refund(id);
  }
}
