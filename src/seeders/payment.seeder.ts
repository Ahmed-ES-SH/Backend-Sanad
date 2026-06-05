import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment } from '../payments/schema/payment.schema';
import { PaymentStatus } from '../payments/enums/payment-status.enum';
import { User } from '../user/schema/user.schema';

@Injectable()
export class PaymentSeeder {
  private readonly logger = new Logger(PaymentSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  private generateRandomId(prefix: string, length: number): string {
    const chars = 'abcdef0123456789';
    let result = prefix;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async seed(): Promise<void> {
    const paymentRepository = this.dataSource.getRepository(Payment);
    const userRepository = this.dataSource.getRepository(User);

    const existingPayments = await paymentRepository.count();
    if (existingPayments > 0) {
      this.logger.log('Payments already seeded, skipping...');
      return;
    }

    const users = await userRepository.find();

    if (users.length === 0) {
      this.logger.warn('No users found, please seed users first');
      return;
    }

    const getRandomUser = (): number | null => {
      const random = Math.random();
      if (random < 0.2) {
        return null; // 20% chance of no user
      }
      const user = users[Math.floor(Math.random() * users.length)];
      return user.id;
    };

    const getRandomStatus = (): PaymentStatus => {
      const weights = {
        [PaymentStatus.SUCCEEDED]: 0.45,
        [PaymentStatus.PENDING]: 0.25,
        [PaymentStatus.FAILED]: 0.15,
        [PaymentStatus.PARTIALLY_REFUNDED]: 0.05,
        [PaymentStatus.REFUNDED]: 0.1,
      };
      const random = Math.random();
      let cumulative = 0;
      const statuses = Object.values(PaymentStatus);
      for (const status of statuses) {
        cumulative += weights[status];
        if (random < cumulative) {
          return status;
        }
      }
      return PaymentStatus.SUCCEEDED;
    };

    const getRandomAmount = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const currencies = ['usd', 'eur', 'egp'];
    const currenciesWeights = [0.5, 0.3, 0.2];

    const getRandomCurrency = (): string => {
      const random = Math.random();
      let cumulative = 0;
      for (let i = 0; i < currencies.length; i++) {
        cumulative += currenciesWeights[i];
        if (random < cumulative) {
          return currencies[i];
        }
      }
      return currencies[0];
    };

    const descriptions = [
      'Payment for web development service',
      'Mobile app development project',
      'UI/UX design consultation',
      'API development and integration',
      'DevOps and cloud setup',
      'Technical consulting session',
      'Security audit service',
      'E-commerce solution payment',
      'CMS development project',
      'Performance optimization service',
      null,
      null,
      null,
    ];

    const getRandomDescription = (): string | null => {
      return descriptions[Math.floor(Math.random() * descriptions.length)];
    };

    const generateStripePaymentIntentId = (): string => {
      return this.generateRandomId('pi_', 24);
    };

    const generateStripeCustomerId = (): string | null => {
      const random = Math.random();
      if (random < 0.3) {
        return null;
      }
      return this.generateRandomId('cus_', 24);
    };

    const payments: Partial<Payment>[] = [];

    for (let i = 0; i < 30; i++) {
      const status = getRandomStatus();
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));

      payments.push({
        userId: getRandomUser(),
        stripePaymentIntentId: generateStripePaymentIntentId(),
        stripeCustomerId: generateStripeCustomerId(),
        amount: getRandomAmount(100, 5000),
        currency: getRandomCurrency(),
        status: status,
        description: getRandomDescription(),
        metadata: {
          orderId: `order_${this.generateRandomId('', 8)}`,
          serviceId: `service_${this.generateRandomId('', 8)}`,
        },
      });
    }

    await paymentRepository.save(payments);
    this.logger.log('Payments seeded successfully');
  }
}
