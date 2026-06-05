import { IsInt, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({ description: 'Updated quantity', minimum: 1 })
  quantity?: number;
}
