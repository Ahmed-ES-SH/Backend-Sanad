import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../enums/payment-status.enum';

class UserBriefDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiPropertyOptional({ description: 'User display name' })
  name?: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  avatar?: string;
}

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment UUID' })
  id: string;

  @ApiProperty({ description: 'User ID', nullable: true })
  userId: number | null;

  @ApiPropertyOptional({
    description: 'User details',
    nullable: true,
    type: UserBriefDto,
  })
  user?: UserBriefDto | null;

  @ApiProperty({ description: 'Stripe PaymentIntent ID' })
  stripePaymentIntentId: string;

  @ApiProperty({ description: 'Stripe Customer ID', nullable: true })
  stripeCustomerId: string | null;

  @ApiProperty({ description: 'Payment amount in dollars' })
  amount: number;

  @ApiProperty({ description: 'ISO 4217 currency code' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment status' })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Metadata', nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
