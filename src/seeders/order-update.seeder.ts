import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceOrder } from '../service-orders/schema/service-order.schema';
import { OrderUpdate } from '../service-orders/schema/order-update.schema';
import { OrderStatus } from '../service-orders/enums/order-status.enum';
import { UpdateAuthor } from '../service-orders/enums/update-author.enum';

@Injectable()
export class OrderUpdateSeeder {
  private readonly logger = new Logger(OrderUpdateSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const orderRepository = this.dataSource.getRepository(ServiceOrder);
    const updateRepository = this.dataSource.getRepository(OrderUpdate);

    const existingUpdates = await updateRepository.count();
    if (existingUpdates > 0) {
      this.logger.log('Order updates already seeded, skipping...');
      return;
    }

    const orders = await orderRepository.find();

    if (orders.length === 0) {
      this.logger.warn('No orders found, please seed orders first');
      return;
    }

    this.logger.log(`Found ${orders.length} orders to add updates to`);

    const updatesData: Partial<OrderUpdate>[] = [];

    for (const order of orders) {
      const orderUpdates = this.generateUpdatesForOrder(order);
      updatesData.push(...orderUpdates);
    }

    await updateRepository.save(updatesData);
    this.logger.log(`Seeded ${updatesData.length} order updates successfully`);
  }

  private generateUpdatesForOrder(order: ServiceOrder): Partial<OrderUpdate>[] {
    const updates: Partial<OrderUpdate>[] = [];
    const orderId = order.id;
    const createdAt = new Date(order.createdAt);

    switch (order.status) {
      case OrderStatus.PENDING:
        updates.push(
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Order placed successfully. Waiting for payment.',
            this.subtractDays(createdAt, 3),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.SYSTEM,
            'Payment pending. Please complete your payment to proceed.',
            this.subtractDays(createdAt, 2),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'I have initiated the payment. Please confirm once processed.',
            this.subtractDays(createdAt, 1),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Payment is being verified. You will receive an update shortly.',
            createdAt,
          ),
        );
        break;

      case OrderStatus.PAID:
        updates.push(
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Order placed successfully.',
            this.subtractDays(createdAt, 5),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.SYSTEM,
            'Payment received successfully.',
            this.subtractDays(createdAt, 4),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Payment confirmed. Your order is now in the queue for assignment.',
            this.subtractDays(createdAt, 3),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Work has been assigned to our development team. We will begin shortly.',
            this.subtractDays(createdAt, 2),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Great! Looking forward to the progress update.',
            this.subtractDays(createdAt, 1),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Initial assessment complete. Starting development phase now.',
            createdAt,
          ),
        );
        break;

      case OrderStatus.IN_PROGRESS:
        updates.push(
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Order placed and payment completed.',
            this.subtractDays(createdAt, 10),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.SYSTEM,
            'Payment confirmed.',
            this.subtractDays(createdAt, 9),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Order assigned to development team. Requirements review in progress.',
            this.subtractDays(createdAt, 8),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Requirements analysis completed. Design phase initiated.',
            this.subtractDays(createdAt, 6),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Can we schedule a call to discuss some additional requirements?',
            this.subtractDays(createdAt, 5),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Call scheduled for tomorrow. Development will incorporate your feedback.',
            this.subtractDays(createdAt, 4),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Design phase completed. Moving to development.',
            this.subtractDays(createdAt, 3),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Development progress at 60%. Core features implemented.',
            this.subtractDays(createdAt, 1),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Current progress: 85%. Entering final testing phase.',
            createdAt,
          ),
        );
        break;

      case OrderStatus.COMPLETED:
        updates.push(
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Order placed.',
            this.subtractDays(createdAt, 20),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.SYSTEM,
            'Payment received.',
            this.subtractDays(createdAt, 19),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Payment confirmed. Project started.',
            this.subtractDays(createdAt, 18),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Requirements and design phases completed.',
            this.subtractDays(createdAt, 15),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Development phase in progress. Keeping you updated.',
            this.subtractDays(createdAt, 10),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'When can we expect the first draft?',
            this.subtractDays(createdAt, 8),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'First draft ready for review. Please provide your feedback.',
            this.subtractDays(createdAt, 5),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Great work! Just a few minor changes needed.',
            this.subtractDays(createdAt, 4),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Revisions completed. Final version submitted.',
            this.subtractDays(createdAt, 2),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Project completed successfully! Thank you for working with us.',
            this.subtractDays(createdAt, 1),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Excellent results! Highly recommend this service.',
            createdAt,
          ),
        );
        break;

      case OrderStatus.CANCELLED:
        updates.push(
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'Order placed.',
            this.subtractDays(createdAt, 8),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.SYSTEM,
            'Payment received.',
            this.subtractDays(createdAt, 7),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Payment confirmed. Work initiated.',
            this.subtractDays(createdAt, 6),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Development started.',
            this.subtractDays(createdAt, 5),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.USER,
            'I need to cancel this order due to budget constraints. Please stop work.',
            this.subtractDays(createdAt, 3),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Work halted as requested. Processing cancellation.',
            this.subtractDays(createdAt, 2),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.ADMIN,
            'Cancellation confirmed. Refund will be processed within 5-7 business days.',
            this.subtractDays(createdAt, 1),
          ),
          this.createUpdate(
            orderId,
            UpdateAuthor.SYSTEM,
            'Refund initiated. Case marked for closure.',
            createdAt,
          ),
        );
        break;
    }

    return updates;
  }

  private createUpdate(
    orderId: string,
    author: UpdateAuthor,
    content: string,
    createdAt: Date,
  ): Partial<OrderUpdate> {
    return {
      orderId,
      author,
      content,
      createdAt,
    };
  }

  private subtractDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }
}
