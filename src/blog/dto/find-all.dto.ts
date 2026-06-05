import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetAllArticlesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Filter by category ID' })
  categoryId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ required: false })
  tag?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search articles by title' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;

    if (value === 'true' || value === true || value === 1 || value === '1') {
      return true;
    }

    if (value === 'false' || value === false || value === 0 || value === '0') {
      return false;
    }

    return undefined;
  })
  @IsBoolean()
  isPublished?: boolean;
}
