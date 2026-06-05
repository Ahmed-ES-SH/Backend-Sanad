import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total number of projects', example: 10 })
  totalProjects: number;

  @ApiProperty({ description: 'Number of published projects', example: 7 })
  publishedProjects: number;

  @ApiProperty({ description: 'Total number of articles', example: 20 })
  totalArticles: number;

  @ApiProperty({ description: 'Number of published articles', example: 15 })
  publishedArticles: number;

  @ApiProperty({ description: 'Total number of services', example: 5 })
  totalServices: number;

  @ApiProperty({ description: 'Number of published services', example: 3 })
  publishedServices: number;

  @ApiProperty({ description: 'Number of unread contact messages', example: 4 })
  unreadMessages: number;

  @ApiProperty({ description: 'Total number of payments', example: 8 })
  totalPayments: number;

  @ApiProperty({
    description: 'Total revenue from succeeded payments in USD',
    example: 500.0,
  })
  totalRevenue: number;

  @ApiProperty({ description: 'Total number of registered users', example: 50 })
  totalUsers: number;

  @ApiPropertyOptional({
    description:
      'Errors encountered while fetching stats for specific entities',
    example: ['projects: Failed to fetch statistics'],
    type: [String],
  })
  errors?: string[];
}
