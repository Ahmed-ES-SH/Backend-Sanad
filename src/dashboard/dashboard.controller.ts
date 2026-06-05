import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/Roles.decorator';
import { UserRoleEnum } from '../auth/types/UserRoleEnum';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get aggregated platform statistics' })
  @ApiResponse({ status: 200, type: DashboardStatsDto })
  async getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }
}
