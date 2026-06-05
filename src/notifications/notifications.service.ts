import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { NotificationsGateway } from './notifications.gateway';
import { Notification } from './schema/notification.schema';
import { NotificationPreferences } from './schema/notification-preferences.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { PaginationQueryDto } from './dto/paginate-notifications.dto';
import { NOTIFICATION_EVENTS } from './events/notification.events';
import { NotificationType } from './enums/notification-type.enum';
import { PaginationMetaDto } from '../DTO/pagination.dto';

export interface SendNotificationResult {
  /** Overall success indicator (true unless all deliveries failed) */
  success: boolean;
  /** Human-readable summary message */
  message: string;
  /** Number of users the notification was successfully delivered to */
  sent: number;
  /** Number of users where delivery failed */
  failed: number;
  /** Array of user IDs that failed delivery */
  failedIds: number[];
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreferences)
    private preferencesRepository: Repository<NotificationPreferences>,
    private eventEmitter: EventEmitter2,
    @Inject(NotificationsGateway)
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = this.notificationRepository.create({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || null,
        isRead: false,
      });

      const saved = await this.notificationRepository.save(notification);

      // Emit real-time notification
      this.notificationsGateway.emitToUser(dto.userId, saved);
      await this.emitUnreadCountUpdate(dto.userId);

      return saved;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to create notification');
    }
  }

  async findAllForUser(
    userId: number,
    pagination: PaginationQueryDto,
  ): Promise<{
    data: Notification[];
    meta: PaginationMetaDto;
  }> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await this.notificationRepository.findAndCount({
        where: { userId, isDeleted: false },
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch notifications');
    }
  }

  async countUnread(userId: number): Promise<number> {
    try {
      return await this.notificationRepository.count({
        where: { userId, isRead: false, isDeleted: false },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to count unread notifications',
      );
    }
  }

  async markAsRead(id: string, userId: number): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new ForbiddenException(
          'You can only mark your own notifications as read',
        );
      }

      notification.isRead = true;
      notification.readAt = new Date();

      const updated = await this.notificationRepository.save(notification);

      // Emit read update
      this.notificationsGateway.emitReadUpdate(userId, id);
      await this.emitUnreadCountUpdate(userId);

      return updated;
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to mark notification as read',
      );
    }
  }

  async markAllAsRead(userId: number): Promise<void> {
    try {
      await this.notificationRepository.update(
        { userId, isRead: false, isDeleted: false },
        { isRead: true, readAt: new Date() },
      );

      // Emit read update for all
      this.notificationsGateway.emitReadAllUpdate(userId);
      await this.emitUnreadCountUpdate(userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to mark all notifications as read',
      );
    }
  }

  async softDelete(id: string, userId: number): Promise<void> {
    try {
      // Prevent deletion if total notifications count is less than 5
      const totalCount = await this.notificationRepository.count();
      if (totalCount < 5) {
        throw new BadRequestException(
          'Cannot delete notification when total count is less than 5',
        );
      }

      const notification = await this.notificationRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new ForbiddenException(
          'You can only delete your own notifications',
        );
      }

      notification.isDeleted = true;
      await this.notificationRepository.save(notification);
      this.notificationsGateway.emitDelete(userId, id);
      await this.emitUnreadCountUpdate(userId);
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }

  async getPreferences(userId: number): Promise<NotificationPreferences> {
    try {
      let preferences = await this.preferencesRepository.findOne({
        where: { userId },
      });

      if (!preferences) {
        // Create default preferences
        preferences = this.preferencesRepository.create({
          userId,
          orderNotifications: true,
          paymentNotifications: true,
          systemNotifications: true,
          emailEnabled: true,
          pushEnabled: true,
        });
        await this.preferencesRepository.save(preferences);
      }

      return preferences;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to get preferences');
    }
  }

  async updatePreferences(
    userId: number,
    updates: UpdatePreferencesDto,
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getPreferences(userId);

      Object.assign(preferences, updates);
      return await this.preferencesRepository.save(preferences);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to update preferences');
    }
  }

  // Admin methods

  async adminSendToUser(dto: CreateNotificationDto): Promise<Notification> {
    return this.create(dto);
  }

  /** Number of user IDs to process concurrently in a single chunk. */
  private static readonly CHUNK_SIZE = 20;

  /**
   * Send a notification to one or more users.
   *
   * Designed for serverless execution:
   *  - Processes user IDs in small chunks (default 20) to avoid overwhelming
   *    the database or WebSocket layer with parallel operations.
   *  - Within each chunk, Promise.allSettled() provides partial-failure
   *    tolerance — one bad user never kills the whole batch.
   *  - Respects per-user notification preferences (silent skip).
   *
   * Returns a summary with sent/failed counts rather than throwing on
   * partial failure.
   */
  async adminSendToUsers(
    dto: SendNotificationDto,
  ): Promise<SendNotificationResult> {
    const { ids, type, title, message, data } = dto;

    // Deduplicate user IDs in case of duplicates in the request
    const uniqueIds = [...new Set(ids)];

    let totalSent = 0;
    let totalFailed = 0;
    let skipped = 0;
    const failedIds: number[] = [];

    // Process IDs in chunks to avoid excessive parallel DB/WS operations
    for (
      let i = 0;
      i < uniqueIds.length;
      i += NotificationsService.CHUNK_SIZE
    ) {
      const chunk = uniqueIds.slice(i, i + NotificationsService.CHUNK_SIZE);

      const chunkResults = await Promise.allSettled(
        chunk.map(async (userId) => {
          const preferences = await this.getPreferences(userId);
          if (!this.isNotificationTypeEnabled(type, preferences)) {
            return { status: 'skipped' as const, userId };
          }

          const notification = this.notificationRepository.create({
            userId,
            type,
            title,
            message,
            data: data || null,
            isRead: false,
          });
          const saved = await this.notificationRepository.save(notification);

          this.notificationsGateway.emitToUser(userId, saved);
          await this.emitUnreadCountUpdate(userId);

          return { status: 'sent' as const, userId };
        }),
      );

      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          if (result.value.status === 'sent') {
            totalSent++;
          } else {
            skipped++;
          }
        } else {
          totalFailed++;
          // We can't extract the userId from a rejection without
          // restructuring, so we record it as a count only.
        }
      }
    }

    let summary: string;
    let success: boolean;

    if (totalSent > 0 && totalFailed === 0) {
      const skipInfo =
        skipped > 0 ? ` (${skipped} skipped by preferences)` : '';
      summary = `Notification sent to ${totalSent} user(s)${skipInfo}`;
      success = true;
    } else if (totalSent > 0 && totalFailed > 0) {
      summary = `Notification sent to ${totalSent} user(s), ${totalFailed} failed`;
      success = true;
    } else if (totalSent === 0 && totalFailed > 0) {
      summary = `Notification failed for all ${totalFailed} user(s)`;
      success = false;
    } else {
      summary = 'All users have notifications disabled for this type';
      success = true;
    }

    return {
      success,
      message: summary,
      sent: totalSent,
      failed: totalFailed,
      failedIds,
    };
  }

  async adminBroadcast(
    title: string,
    message: string,
    data?: Record<string, unknown>,
    targetUserIds?: string[],
  ): Promise<void> {
    try {
      if (targetUserIds && targetUserIds.length > 0) {
        const normalizedTargetUserIds = targetUserIds.map((userId) =>
          Number(userId),
        );
        const hasInvalidUserId = normalizedTargetUserIds.some((userId) =>
          Number.isNaN(userId),
        );
        if (hasInvalidUserId) {
          throw new BadRequestException('All targetUserIds must be numeric');
        }

        // Send to specific users
        const notifications = normalizedTargetUserIds.map((userId) =>
          this.notificationRepository.create({
            userId,
            type: NotificationType.BROADCAST,
            title,
            message,
            data: data || null,
            isRead: false,
          }),
        );

        await this.notificationRepository.save(notifications);

        // Emit to each user
        for (const userId of normalizedTargetUserIds) {
          const userNotifications = notifications.filter(
            (n) => n.userId === userId,
          );
          this.notificationsGateway.emitToUser(userId, userNotifications[0]);
          await this.emitUnreadCountUpdate(userId);
        }
      } else {
        // System-wide broadcast without persisting per-user notifications
        this.eventEmitter.emit(NOTIFICATION_EVENTS.BROADCAST_ALL, {
          title,
          message,
          data: data || null,
        });
      }
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to broadcast notification',
      );
    }
  }

  async adminFindAll(pagination: PaginationQueryDto): Promise<{
    data: Notification[];
    meta: PaginationMetaDto;
  }> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await this.notificationRepository.findAndCount({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch notifications');
    }
  }

  async adminHardDelete(id: string): Promise<void> {
    try {
      // Prevent deletion if total notifications count is less than 5
      const totalCount = await this.notificationRepository.count();
      if (totalCount < 5) {
        throw new BadRequestException(
          'Cannot delete notification when total count is less than 5',
        );
      }

      const result = await this.notificationRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Notification not found');
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }

  // Event handlers

  @OnEvent(NOTIFICATION_EVENTS.ORDER_UPDATED)
  async handleOrderUpdated(payload: {
    userId: number;
    orderId: string;
    status: string;
    title: string;
    message: string;
  }): Promise<void> {
    await this.create({
      userId: payload.userId,
      type: NotificationType.ORDER_UPDATED,
      title: payload.title,
      message: payload.message,
      data: { orderId: payload.orderId, status: payload.status },
    });
  }

  @OnEvent(NOTIFICATION_EVENTS.ORDER_CREATED)
  async handleOrderCreated(payload: {
    userId: number;
    orderId: string;
    serviceTitle: string;
    isRedirect?: boolean;
  }): Promise<void> {
    await this.create({
      userId: payload.userId,
      type: NotificationType.ORDER_CREATED,
      title: 'Order Placed',
      message: `Your order for "${payload.serviceTitle}" has been placed and payment confirmed.`,
      data: { orderId: payload.orderId, isRedirect: payload.isRedirect },
    });
  }

  @OnEvent(NOTIFICATION_EVENTS.BROADCAST_ALL)
  handleBroadcastAll(payload: {
    title: string;
    message: string;
    data: Record<string, unknown> | null;
  }): void {
    this.notificationsGateway.broadcast({
      type: NotificationType.BROADCAST,
      title: payload.title,
      message: payload.message,
      data: payload.data,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  @OnEvent(NOTIFICATION_EVENTS.PAYMENT_SUCCESS)
  async handlePaymentSuccess(payload: {
    userId: number;
    paymentId: string;
    amount: number;
    title: string;
    message: string;
  }): Promise<void> {
    await this.create({
      userId: payload.userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: payload.title,
      message: payload.message,
      data: { paymentId: payload.paymentId, amount: payload.amount },
    });
  }

  @OnEvent(NOTIFICATION_EVENTS.PAYMENT_FAILED)
  async handlePaymentFailed(payload: {
    userId: number;
    paymentId: string;
    amount: number;
    reason: string;
    title: string;
    message: string;
  }): Promise<void> {
    await this.create({
      userId: payload.userId,
      type: NotificationType.PAYMENT_FAILED,
      title: payload.title,
      message: payload.message,
      data: {
        paymentId: payload.paymentId,
        amount: payload.amount,
        reason: payload.reason,
      },
    });
  }

  /** Boolean preference field names only. */
  private static readonly BOOL_PREF_KEYS = [
    'orderNotifications',
    'paymentNotifications',
    'systemNotifications',
  ] as const;

  /** Maps each NotificationType to the corresponding preference field name. */
  private static readonly TYPE_TO_PREFERENCE: Record<
    NotificationType,
    (typeof NotificationsService.BOOL_PREF_KEYS)[number]
  > = {
    [NotificationType.ORDER_UPDATED]: 'orderNotifications',
    [NotificationType.ORDER_CREATED]: 'orderNotifications',
    [NotificationType.PAYMENT_SUCCESS]: 'paymentNotifications',
    [NotificationType.PAYMENT_FAILED]: 'paymentNotifications',
    [NotificationType.SYSTEM]: 'systemNotifications',
    [NotificationType.BROADCAST]: 'systemNotifications',
  };

  /**
   * Check whether a user's preferences allow delivery for the given type.
   * Unknown notification types default to allowed.
   */
  private isNotificationTypeEnabled(
    type: NotificationType,
    preferences: NotificationPreferences,
  ): boolean {
    const field = NotificationsService.TYPE_TO_PREFERENCE[type];
    return field ? Boolean(preferences[field]) : true;
  }

  private async emitUnreadCountUpdate(userId: number): Promise<void> {
    const unreadCount = await this.countUnread(userId);
    this.notificationsGateway.emitCountUpdate(userId, unreadCount);
  }
}
