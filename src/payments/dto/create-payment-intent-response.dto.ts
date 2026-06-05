import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentResponseDto {
  @ApiProperty({
    description: 'Stripe client secret for confirming the payment',
  })
  clientSecret: string;

  @ApiProperty({ description: 'Internal payment record ID' })
  paymentId: string;

  @ApiProperty({ description: 'Stripe PaymentIntent ID' })
  stripePaymentIntentId: string;
}
