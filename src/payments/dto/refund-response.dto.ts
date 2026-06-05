import { ApiProperty } from '@nestjs/swagger';

export class RefundResponseDto {
  @ApiProperty({ description: 'Payment UUID' })
  id: string;

  @ApiProperty({ description: 'Updated payment status' })
  status: string;

  @ApiProperty({ description: 'Refund confirmation message' })
  message: string;
}
