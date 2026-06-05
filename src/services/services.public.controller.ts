import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ServicesService } from './services.service';
import { Service } from './schema/service.schema';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaginationDto, PaginationMetaDto } from 'src/DTO/pagination.dto';
import { ServicesPaginationQueryDto } from './dto/services-pagination-query.dto';

@ApiTags('Services (Public)')
@Public()
@UseGuards(ThrottlerGuard)
@Controller('services')
export class ServicesPublicController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all published services' })
  @ApiResponse({
    status: 200,
    description: 'List of published services sorted by order',
  })
  async findPublished(
    @Query() query: ServicesPaginationQueryDto,
  ): Promise<{ data: Service[]; meta: PaginationMetaDto }> {
    const { data, meta } = await this.servicesService.findPublished(query);
    return { data, meta };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published service by slug' })
  @ApiParam({ name: 'slug', description: 'Service slug', type: String })
  @ApiResponse({ status: 200, description: 'Service details' })
  @ApiResponse({ status: 404, description: 'Published service not found' })
  async findBySlug(@Param('slug') slug: string): Promise<Service> {
    return this.servicesService.findBySlug(slug);
  }
}
