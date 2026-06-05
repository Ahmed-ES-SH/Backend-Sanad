import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'UUID of the service to order' })
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ description: 'Optional notes from the user' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
