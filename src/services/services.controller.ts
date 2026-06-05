import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './schema/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ReorderServicesDto } from './dto/reorder-services.dto';
import { ServicesPaginationQueryDto } from './dto/services-pagination-query.dto';
import { Roles } from '../auth/decorators/Roles.decorator';
import { UserRoleEnum } from '../auth/types/UserRoleEnum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationMetaDto } from '../DTO/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
@Controller('admin/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input' })
  async create(@Body() dto: CreateServiceDto): Promise<Service> {
    return this.servicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all services with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of services' })
  async findAll(@Query() query: ServicesPaginationQueryDto): Promise<{
    data: Service[];
    meta: PaginationMetaDto;
  }> {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  @ApiResponse({ status: 200, description: 'Service found' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Service> {
    return this.servicesService.findOneOrFail(id);
  }

  // IMPORTANT: reorder route MUST be registered before :id routes to avoid path collision
  @Patch('reorder')
  @ApiOperation({ summary: 'Batch-reorder services' })
  @ApiResponse({ status: 200, description: 'Services reordered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input' })
  async reorder(@Body() dto: ReorderServicesDto): Promise<{ message: string }> {
    return this.servicesService.reorder(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing service' })
  @ApiParam({ name: 'id', description: 'Service UUID', type: String })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Toggle publish status of a service' })
  @ApiParam({ name: 'id', description: 'Service UUID', type: String })
  @ApiResponse({ status: 200, description: 'Publish status toggled' })
  @ApiResponse({
    status: 400,
    description: 'Missing required fields for publish',
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async togglePublish(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ id: string; isPublished: boolean; message: string }> {
    return this.servicesService.togglePublish(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', description: 'Service UUID', type: String })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.servicesService.remove(id);
  }
}
