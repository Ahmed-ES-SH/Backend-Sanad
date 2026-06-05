import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceOrder } from '../service-orders/schema/service-order.schema';
import { OrderStatus } from '../service-orders/enums/order-status.enum';
import { User } from '../user/schema/user.schema';
import { Service } from '../services/schema/service.schema';

@Injectable()
export class ServiceOrderSeeder {
  private readonly logger = new Logger(ServiceOrderSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const orderRepository = this.dataSource.getRepository(ServiceOrder);
    const userRepository = this.dataSource.getRepository(User);
    const serviceRepository = this.dataSource.getRepository(Service);

    const existingOrders = await orderRepository.count();
    if (existingOrders > 0) {
      this.logger.log('Service orders already seeded, skipping...');
      return;
    }

    const users = await userRepository.find();
    const services = await serviceRepository.find();

    if (users.length === 0) {
      this.logger.warn('No users found, please seed users first');
      return;
    }

    if (services.length === 0) {
      this.logger.warn('No services found, please seed services first');
      return;
    }

    const getRandomUser = (): number => {
      const user = users[Math.floor(Math.random() * users.length)];
      return user.id;
    };

    const getRandomService = (): string => {
      const service = services[Math.floor(Math.random() * services.length)];
      return service.id;
    };

    const getRandomStatus = (): OrderStatus => {
      const statuses = Object.values(OrderStatus);
      return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const getRandomAmount = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const currencies = ['usd', 'eur', 'egp'];
    const currenciesWeights = [0.6, 0.3, 0.1];

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

    const notesOptions = [
      'Looking forward to working with you!',
      'Please contact me for more details about the project.',
      'I need this completed as soon as possible.',
      'Can we schedule a call to discuss the requirements?',
      'I have a detailed specification document to share.',
      null,
      null,
      null,
    ];

    const getRandomNote = (): string | null => {
      const note =
        notesOptions[Math.floor(Math.random() * notesOptions.length)];
      return note;
    };

    const orderData: Partial<ServiceOrder>[] = [
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(100, 500),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PAID,
        amount: getRandomAmount(500, 1500),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.IN_PROGRESS,
        amount: getRandomAmount(1500, 3000),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.COMPLETED,
        amount: getRandomAmount(1000, 2500),
        currency: getRandomCurrency(),
        notes: 'Project completed successfully!',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.CANCELLED,
        amount: getRandomAmount(200, 800),
        currency: getRandomCurrency(),
        notes: 'Customer requested cancellation.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(150, 600),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PAID,
        amount: getRandomAmount(600, 1200),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.IN_PROGRESS,
        amount: getRandomAmount(2000, 4000),
        currency: getRandomCurrency(),
        notes: 'Project in development phase.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(250, 750),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.COMPLETED,
        amount: getRandomAmount(1200, 2800),
        currency: getRandomCurrency(),
        notes: 'Delivered and approved by client.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PAID,
        amount: getRandomAmount(800, 1800),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(300, 900),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.IN_PROGRESS,
        amount: getRandomAmount(2500, 5000),
        currency: getRandomCurrency(),
        notes: 'Mid-stage review completed.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.CANCELLED,
        amount: getRandomAmount(400, 1000),
        currency: getRandomCurrency(),
        notes: 'Scope changed by client.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(180, 550),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PAID,
        amount: getRandomAmount(700, 1400),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.COMPLETED,
        amount: getRandomAmount(1500, 3000),
        currency: getRandomCurrency(),
        notes: 'Excellent collaboration!',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.IN_PROGRESS,
        amount: getRandomAmount(1800, 3500),
        currency: getRandomCurrency(),
        notes: 'Awaiting client feedback.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(220, 650),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PAID,
        amount: getRandomAmount(550, 1100),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.COMPLETED,
        amount: getRandomAmount(2000, 4000),
        currency: getRandomCurrency(),
        notes: 'All deliverables completed.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(280, 720),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.IN_PROGRESS,
        amount: getRandomAmount(3000, 6000),
        currency: getRandomCurrency(),
        notes: 'Complex project, progressing well.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PAID,
        amount: getRandomAmount(900, 1600),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.CANCELLED,
        amount: getRandomAmount(350, 850),
        currency: getRandomCurrency(),
        notes: 'Budget constraints.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(190, 580),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PAID,
        amount: getRandomAmount(650, 1300),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.COMPLETED,
        amount: getRandomAmount(2200, 4500),
        currency: getRandomCurrency(),
        notes: 'Client satisfied with results.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.IN_PROGRESS,
        amount: getRandomAmount(1700, 3200),
        currency: getRandomCurrency(),
        notes: 'Final phase in progress.',
      },
      {
        userId: getRandomUser(),
        serviceId: getRandomService(),
        status: OrderStatus.PENDING,
        amount: getRandomAmount(260, 680),
        currency: getRandomCurrency(),
        notes: getRandomNote(),
      },
    ];

    await orderRepository.save(orderData);
    this.logger.log('Service orders seeded successfully');
  }
}
