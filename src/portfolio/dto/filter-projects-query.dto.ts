import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/DTO/pagination.dto';

export class FilterProjectsQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Filter by category ID' })
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @ApiPropertyOptional({
    description: 'Filter by tech stack (comma-separated)',
    type: [String],
  })
  techStack?: string[];

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter featured projects only' })
  featured?: boolean;
}
