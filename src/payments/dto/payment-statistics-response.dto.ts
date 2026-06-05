import { ApiProperty } from '@nestjs/swagger';

export class PaymentStatisticsResponseDto {
  @ApiProperty({ description: 'Total number of payments' })
  total: number;

  @ApiProperty({ description: 'Number of succeeded payments' })
  succeeded: number;

  @ApiProperty({ description: 'Number of pending payments' })
  pending: number;

  @ApiProperty({ description: 'Number of refunded payments' })
  refunded: number;

  @ApiProperty({ description: 'Number of failed payments' })
  failed: number;

  @ApiProperty({ description: 'Number of partially refunded payments' })
  partiallyRefunded: number;
}
