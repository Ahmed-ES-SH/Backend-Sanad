import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AdminFilterProjectsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search term for project title or description',
  })
  search?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Filter by category ID' })
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @ApiPropertyOptional({
    description: 'Filter by tech stack (comma-separated)',
    type: [String],
  })
  techStack?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter featured projects only' })
  featured?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter published projects only' })
  isPublished?: boolean;
}
