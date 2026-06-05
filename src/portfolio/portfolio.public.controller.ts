import { Controller, Get, Query, Param } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FilterProjectsQueryDto } from './dto/filter-projects-query.dto';

@ApiTags('Portfolio (Public)')
@Controller('portfolio')
@Public()
export class PortfolioPublicController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'List published projects with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'Return array of published projects.',
  })
  async findPublished(@Query() filterDto: FilterProjectsQueryDto) {
    return this.portfolioService.findPublished(filterDto);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single project by slug' })
  @ApiParam({ name: 'slug', description: 'Project SEO-friendly slug' })
  @ApiResponse({ status: 200, description: 'Return project details.' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not published.',
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.portfolioService.findBySlug(slug);
  }
}
