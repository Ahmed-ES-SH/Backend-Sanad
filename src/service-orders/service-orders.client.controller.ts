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
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ServiceOrdersService } from './service-orders.service';
import { GetUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './enums/order-status.enum';

@ApiTags('Service Orders (User)')
@ApiBearerAuth()
@Controller('orders')
export class ServiceOrdersClientController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found or unavailable',
  })
  async createOrder(
    @GetUser('id') userId: number,
    @Query() dto: CreateOrderDto,
  ) {
    return this.serviceOrdersService.createOrder(userId, dto);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Initiate payment for a pending order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated',
    schema: {
      example: {
        clientSecret: 'pi_xxx_secret_xxx',
        paymentId: 'uuid',
        stripePaymentIntentId: 'pi_xxx',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Order not in pending status or payment already initiated',
  })
  async initiatePayment(
    @GetUser('id') userId: number,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.serviceOrdersService.initiatePayment(userId, id);
  }

  @Get()
  @ApiOperation({ summary: 'List current user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  async findUserOrders(
    @GetUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
  ) {
    return this.serviceOrdersService.findUserOrders(
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order details' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @GetUser('id') userId: number,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.serviceOrdersService.findOneForUser(userId, id);
  }
}
