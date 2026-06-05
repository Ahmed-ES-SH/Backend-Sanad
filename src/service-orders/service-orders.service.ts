import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ServiceOrder } from './schema/service-order.schema';
import { OrderUpdate } from './schema/order-update.schema';
import { Service } from '../services/schema/service.schema';
import { PaymentsService } from '../payments/payments.service';
import { OrderStatus } from './enums/order-status.enum';
import { UpdateAuthor } from './enums/update-author.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddOrderUpdateDto } from './dto/add-order-update.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { NOTIFICATION_EVENTS } from '../notifications/events/notification.events';
import { PaginationMetaDto } from '../DTO/pagination.dto';

@Injectable()
export class ServiceOrdersService {
  private readonly logger = new Logger(ServiceOrdersService.name);

  constructor(
    @InjectRepository(ServiceOrder)
    private readonly orderRepo: Repository<ServiceOrder>,
    @InjectRepository(OrderUpdate)
    private readonly updateRepo: Repository<OrderUpdate>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ──────────────────────────────────────────────────────────────────
  // User: Create Order
  // ──────────────────────────────────────────────────────────────────

  async createOrder(
    userId: number,
    dto: CreateOrderDto,
  ): Promise<ServiceOrder> {
    const service = await this.serviceRepo.findOne({
      where: { id: dto.serviceId, isPublished: true },
    });

    if (!service) {
      throw new NotFoundException(
        `Service "${dto.serviceId}" not found or unavailable`,
      );
    }

    const order = this.orderRepo.create({
      userId,
      serviceId: service.id,
      status: OrderStatus.PENDING,
      amount: service.basePrice,
      currency: 'usd',
      notes: dto.notes ?? null,
    });

    const saved = await this.orderRepo.save(order);

    // System timeline entry
    await this.updateRepo.save(
      this.updateRepo.create({
        orderId: saved.id,
        author: UpdateAuthor.SYSTEM,
        content: `Order created for service "${service.title}".`,
      }),
    );

    return saved;
  }

  // ──────────────────────────────────────────────────────────────────
  // User: Initiate Payment
  // ──────────────────────────────────────────────────────────────────

  async initiatePayment(
    userId: number,
    orderId: string,
  ): Promise<{
    clientSecret: string;
    paymentId: string;
    stripePaymentIntentId: string;
  }> {
    const order = await this.findOrderForUser(userId, orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot initiate payment: order status is "${order.status}". Only pending orders can be paid.`,
      );
    }

    if (order.paymentId) {
      throw new BadRequestException(
        'Payment already initiated for this order. Check current payment status.',
      );
    }

    const result = await this.paymentsService.createPaymentIntent({
      amount: order.amount,
      currency: order.currency,
      description: `Service Order: ${order.service?.title ?? order.serviceId}`,
      userId,
      // ← orderId + serviceId are embedded in the Stripe PaymentIntent metadata
      // so the webhook handler can read them from intent.metadata directly.
      orderId: order.id,
      serviceId: order.serviceId,
    });

    // Link payment to order
    order.paymentId = result.paymentId;
    await this.orderRepo.save(order);

    await this.updateRepo.save(
      this.updateRepo.create({
        orderId: order.id,
        author: UpdateAuthor.SYSTEM,
        content:
          'Payment initiated. Awaiting confirmation from payment gateway.',
      }),
    );

    return result;
  }

  // ──────────────────────────────────────────────────────────────────
  // Webhook: Mark order as PAID (called after Stripe confirms payment)
  // ──────────────────────────────────────────────────────────────────

  @OnEvent('payment.succeeded')
  async handlePaymentSucceeded(payload: {
    orderId?: string;
    serviceId?: string;
    userId?: number;
    paymentId?: string;
    amount?: number;
  }): Promise<void> {
    // ── Validation gate ──────────────────────────────────────────────
    // At minimum we need a paymentId to do anything meaningful.
    if (!payload.paymentId) {
      this.logger.warn(
        'payment.succeeded received with no paymentId. Payload dropped.',
      );
      return;
    }

    // Path A: existing order flow — orderId must be a non-empty string
    if (payload.orderId) {
      await this.markOrderAsPaid(payload.orderId);
      return;
    }

    // Path B: auto-create flow — both serviceId and userId are required
    if (payload.serviceId && payload.userId) {
      await this.createOrderFromPayment(
        payload.userId,
        payload.serviceId,
        payload.paymentId,
      );
      return;
    }

    // Neither path could be resolved — log for ops visibility
    this.logger.warn(
      `payment.succeeded for paymentId=${payload.paymentId} had no orderId and no serviceId+userId. No order action taken.`,
    );
  }

  private async createOrderFromPayment(
    userId: number,
    serviceId: string,
    paymentId: string,
  ): Promise<void> {
    // ── Idempotency guard ────────────────────────────────────────────
    // If an order for this paymentId already exists (e.g. webhook retry,
    // race condition), we do NOT create a duplicate. Instead, we re-emit
    // ORDER_CREATED so the client is redirected to the existing order.
    const existing = await this.orderRepo.findOne({
      where: { paymentId },
      relations: ['service'],
    });

    if (existing) {
      this.logger.debug(
        `Order ${existing.id} already exists for paymentId ${paymentId}. Re-routing user to existing order.`,
      );
      this.eventEmitter.emit(NOTIFICATION_EVENTS.ORDER_CREATED, {
        userId,
        orderId: existing.id,
        serviceTitle: existing.service?.title ?? 'your service',
        isRedirect: true,
      });
      return;
    }

    // ── Normal creation path ─────────────────────────────────────────
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId, isPublished: true },
    });

    if (!service) {
      this.logger.warn(
        `createOrderFromPayment: Service ${serviceId} not found or unpublished. Skipping.`,
      );
      return;
    }

    const order = this.orderRepo.create({
      userId,
      serviceId: service.id,
      paymentId,
      status: OrderStatus.PAID,
      amount: service.basePrice,
      currency: 'usd',
    });

    const saved = await this.orderRepo.save(order);

    await this.updateRepo.save([
      this.updateRepo.create({
        orderId: saved.id,
        author: UpdateAuthor.SYSTEM,
        content: `Order created for service "${service.title}".`,
      }),
      this.updateRepo.create({
        orderId: saved.id,
        author: UpdateAuthor.SYSTEM,
        content: 'Payment confirmed. Your order is now being processed.',
      }),
    ]);

    this.eventEmitter.emit(NOTIFICATION_EVENTS.ORDER_CREATED, {
      userId,
      orderId: saved.id,
      serviceTitle: service.title,
      isRedirect: false,
    });

    this.logger.log(
      `Auto-created order ${saved.id} (PAID) for user ${userId} via payment ${paymentId}`,
    );
  }

  async markOrderAsPaid(orderId: string): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      this.logger.warn(
        `markOrderAsPaid: Order ${orderId} not found. Skipping.`,
      );
      return;
    }

    if (order.status === OrderStatus.PAID) {
      this.logger.debug(`Order ${orderId} already paid. Idempotent skip.`);
      return;
    }

    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    await this.updateRepo.save(
      this.updateRepo.create({
        orderId: order.id,
        author: UpdateAuthor.SYSTEM,
        content: 'Payment confirmed. Your order is now being processed.',
      }),
    );

    this.logger.log(`Order ${orderId} marked as PAID`);
  }

  // ──────────────────────────────────────────────────────────────────
  // User: List My Orders
  // ──────────────────────────────────────────────────────────────────

  async findUserOrders(
    userId: number,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
    search?: string,
  ): Promise<{ data: ServiceOrder[]; meta: PaginationMetaDto }> {
    page = Math.max(page, 1);
    limit = Math.max(limit, 1);

    const where: FindOptionsWhere<ServiceOrder> = { userId };
    if (status !== undefined) {
      where.status = status;
    }

    if (search) {
      where.service = { title: Like(`%${search}%`) };
    }

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['service', 'updates'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────
  // User: Get Single Order (ownership check)
  // ──────────────────────────────────────────────────────────────────

  async findOneForUser(userId: number, orderId: string): Promise<ServiceOrder> {
    return this.findOrderForUser(userId, orderId);
  }

  // ──────────────────────────────────────────────────────────────────
  // Admin: List All Orders
  // ──────────────────────────────────────────────────────────────────

  async findAll(
    query: OrderFilterDto,
  ): Promise<{ data: ServiceOrder[]; meta: PaginationMetaDto }> {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      serviceId,
      search,
      categoryId,
    } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.service', 'service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.updates', 'updates');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    if (userId) {
      qb.andWhere('order.userId = :userId', { userId });
    }
    if (serviceId) {
      qb.andWhere('order.serviceId = :serviceId', { serviceId });
    }
    if (categoryId) {
      qb.andWhere('service.categoryId = :categoryId', { categoryId });
    }
    if (search) {
      qb.andWhere('user.name ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────
  // Admin: Get Single Order
  // ──────────────────────────────────────────────────────────────────

  async findOneAdmin(orderId: string): Promise<ServiceOrder> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['service', 'user', 'updates', 'payment'],
    });

    if (!order) throw new NotFoundException(`Order "${orderId}" not found`);
    return order;
  }

  // ──────────────────────────────────────────────────────────────────
  // Admin: Update Order Status
  // ──────────────────────────────────────────────────────────────────

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<ServiceOrder> {
    const order = await this.findOneAdmin(orderId);
    const prevStatus = order.status;

    order.status = dto.status;
    await this.orderRepo.save(order);

    await this.updateRepo.save(
      this.updateRepo.create({
        orderId: order.id,
        author: UpdateAuthor.ADMIN,
        content: `Order status changed from "${prevStatus}" to "${dto.status}".`,
      }),
    );

    return order;
  }

  // ──────────────────────────────────────────────────────────────────
  // Admin/User: Add Timeline Update
  // ──────────────────────────────────────────────────────────────────

  async addUpdate(
    orderId: string,
    dto: AddOrderUpdateDto,
    author: UpdateAuthor = UpdateAuthor.ADMIN,
  ): Promise<OrderUpdate> {
    await this.findOneAdmin(orderId);

    const update = this.updateRepo.create({
      orderId,
      author,
      content: dto.content,
    });

    return this.updateRepo.save(update);
  }

  // ──────────────────────────────────────────────────────────────────
  // Private Helpers
  // ──────────────────────────────────────────────────────────────────

  private async findOrderForUser(
    userId: number,
    orderId: string,
  ): Promise<ServiceOrder> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['service', 'updates'],
    });

    if (!order) throw new NotFoundException(`Order "${orderId}" not found`);
    if (order.userId !== userId) throw new ForbiddenException('Access denied');

    return order;
  }
}
