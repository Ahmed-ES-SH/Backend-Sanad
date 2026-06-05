import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentIntentDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.5)
  @ApiProperty({ description: 'Payment amount in dollars', example: 50.0 })
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  @ApiPropertyOptional({
    description: 'ISO 4217 currency code',
    default: 'usd',
    example: 'usd',
  })
  currency?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Payment description',
    example: 'Web Development Consultation',
  })
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Numeric user ID to associate with the payment',
    example: 123,
  })
  userId?: number;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'UUID of the service being paid for (for direct payments)',
  })
  serviceId?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'UUID of the service order being paid (stored in Stripe metadata)',
  })
  orderId?: string;
}
