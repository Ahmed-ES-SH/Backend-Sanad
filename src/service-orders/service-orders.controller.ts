import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
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
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/Roles.decorator';
import { UserRoleEnum } from '../auth/types/UserRoleEnum';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddOrderUpdateDto } from './dto/add-order-update.dto';
import { OrderFilterDto } from './dto/order-filter.dto';

@ApiTags('Service Orders (Admin)')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@Controller('admin/orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all service orders (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'paid', 'in_progress', 'completed', 'cancelled'],
  })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'serviceId', required: false, type: String })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by order owner name (case-insensitive)',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by service category ID (UUID)',
  })
  @ApiResponse({ status: 200, description: 'List of all orders' })
  async findAll(@Query() query: OrderFilterDto) {
    return this.serviceOrdersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order details (admin)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order details with timeline' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceOrdersService.findOneAdmin(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.serviceOrdersService.updateStatus(id, dto);
  }

  @Post(':id/updates')
  @ApiOperation({ summary: 'Add timeline update to order (admin)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 201, description: 'Timeline update added' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async addUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddOrderUpdateDto,
  ) {
    return this.serviceOrdersService.addUpdate(id, dto);
  }
}
