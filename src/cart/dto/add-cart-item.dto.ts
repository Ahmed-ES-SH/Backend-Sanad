import { IsUUID, IsInt, Min, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCartItemDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Service ID to add to cart', type: String })
  serviceId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({ description: 'Quantity', default: 1, minimum: 1 })
  quantity?: number = 1;
}
