import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrder } from './schema/service-order.schema';
import { OrderUpdate } from './schema/order-update.schema';
import { Service } from '../services/schema/service.schema';
import { ServiceOrdersService } from './service-orders.service';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersClientController } from './service-orders.client.controller';
import { PaymentsModule } from '../payments/payments.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrder, OrderUpdate, Service]),
    PaymentsModule,
    AuthModule,
  ],
  controllers: [ServiceOrdersController, ServiceOrdersClientController],
  providers: [ServiceOrdersService, RolesGuard],
  exports: [ServiceOrdersService],
})
export class ServiceOrdersModule {}
