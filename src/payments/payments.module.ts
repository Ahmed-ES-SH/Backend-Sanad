import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './schema/payment.schema';
import { User } from '../user/schema/user.schema';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsClientController } from './payments.client.controller';
import { PaymentsWebhookController } from './payments.webhook.controller';
import { ConfigModule } from '@nestjs/config';
import { StripeModule } from '../stripe/stripe.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User]),
    ConfigModule,
    StripeModule,
    AuthModule,
  ],
  controllers: [
    PaymentsController,
    PaymentsClientController,
    PaymentsWebhookController,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
