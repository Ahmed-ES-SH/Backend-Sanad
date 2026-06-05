import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Roles } from '../auth/decorators/Roles.decorator';
import { UserRoleEnum } from '../auth/types/UserRoleEnum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ReorderProjectsDto } from './dto/reorder-projects.dto';
import { AdminFilterProjectsQueryDto } from './dto/admin-filter-projects-query.dto';

@ApiTags('Portfolio (Admin)')
@Controller('admin/portfolio')
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'List all projects (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated list of all projects.',
  })
  findAll(@Query() query: AdminFilterProjectsQueryDto) {
    return this.portfolioService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single project by ID' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Return a single project.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolioService.findOne(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Batch reorder projects' })
  @ApiResponse({ status: 200, description: 'Projects reordered successfully.' })
  reorder(@Body() reorderProjectsDto: ReorderProjectsDto) {
    return this.portfolioService.reorder(reorderProjectsDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({
    description: 'The project has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.portfolioService.create(createProjectDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.portfolioService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolioService.remove(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Toggle project publish status' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'Publish status toggled successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., missing cover image).',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  togglePublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolioService.togglePublish(id);
  }

  @Patch(':id/feature')
  @ApiOperation({ summary: 'Toggle project featured status' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'Featured status toggled successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., featured limit reached).',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  toggleFeatured(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolioService.toggleFeatured(id);
  }
}
