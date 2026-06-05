import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Represents a single guest cart item for merging
 */
export class GuestCartItemDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Service ID from guest cart', type: String })
  serviceId: string;

  @IsInt()
  @Min(1)
  @Max(99)
  @ApiProperty({
    description: 'Quantity of the service',
    minimum: 1,
    maximum: 99,
  })
  quantity: number;
}

/**
 * DTO for merging guest cart with authenticated user's cart
 */
export class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  @ApiProperty({
    description: 'Array of guest cart items to merge',
    type: [GuestCartItemDto],
    example: [
      { serviceId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2 },
      { serviceId: 'b2c3d4e5-f6a7-8901-bcde-f23456789012', quantity: 1 },
    ],
  })
  items: GuestCartItemDto[];
}

/**
 * Response DTO for merge result
 */
export class MergeCartResultDto {
  @ApiProperty({ description: 'Whether merge was successful' })
  success: boolean;

  @ApiProperty({ description: 'Message describing the result' })
  message: string;

  @ApiProperty({ description: 'The merged cart data' })
  cart: {
    id: string;
    userId: number;
    items: Array<{
      id: string;
      serviceId: string;
      serviceTitle: string;
      serviceSlug: string;
      serviceIconUrl: string | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    totalItems: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiPropertyOptional({ description: 'Items that failed validation' })
  failedItems?: Array<{
    serviceId: string;
    reason: string;
  }>;
}
