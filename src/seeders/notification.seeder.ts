import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Notification } from '../notifications/schema/notification.schema';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { User } from '../user/schema/user.schema';

@Injectable()
export class NotificationSeeder {
  private readonly logger = new Logger(NotificationSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const notificationRepository = this.dataSource.getRepository(Notification);
    const userRepository = this.dataSource.getRepository(User);

    const existingNotifications = await notificationRepository.count();
    if (existingNotifications > 0) {
      this.logger.log('Notifications already seeded, skipping...');
      return;
    }

    const users = await userRepository.find();

    if (users.length === 0) {
      this.logger.warn('No users found, please seed users first');
      return;
    }

    // Only use first 5 users - need to get their UUIDs or use string representation
    // Since notification.userId is UUID but user.id is integer, we'll generate UUIDs for the first 5 users

    const getRandomType = (): NotificationType => {
      const types = Object.values(NotificationType);
      return types[Math.floor(Math.random() * types.length)];
    };

    const isRead = Math.random() < 0.4;

    const getReadAt = (read: boolean, createdAt: Date): Date | null => {
      if (!read) return null;
      const readAt = new Date(createdAt);
      readAt.setHours(readAt.getHours() + Math.floor(Math.random() * 24));
      return readAt;
    };

    const getRandomTypeData = (
      type: NotificationType,
    ): Record<string, unknown> | null => {
      switch (type) {
        case NotificationType.ORDER_UPDATED:
          return {
            orderId: `order_${Math.floor(Math.random() * 1000)}`,
            status: ['pending', 'in_progress', 'completed'][
              Math.floor(Math.random() * 3)
            ],
          };
        case NotificationType.PAYMENT_SUCCESS:
          return {
            paymentId: `pay_${Math.floor(Math.random() * 1000)}`,
            amount: Math.floor(Math.random() * 5000),
          };
        case NotificationType.PAYMENT_FAILED:
          return {
            paymentId: `pay_${Math.floor(Math.random() * 1000)}`,
            reason: 'Payment was declined',
          };
        case NotificationType.SYSTEM:
          return {
            systemId: `sys_${Math.floor(Math.random() * 100)}`,
          };
        case NotificationType.BROADCAST:
          return {
            broadcastId: `bc_${Math.floor(Math.random() * 100)}`,
          };
        default:
          return null;
      }
    };

    const notificationTemplates = [
      {
        type: NotificationType.ORDER_UPDATED,
        title: 'Order Status Updated',
        message: 'Your order status has been updated to {status}.',
      },
      {
        type: NotificationType.PAYMENT_SUCCESS,
        title: 'Payment Successful',
        message:
          'Your payment of {amount} {currency} has been processed successfully.',
      },
      {
        type: NotificationType.PAYMENT_FAILED,
        title: 'Payment Failed',
        message:
          'Your payment attempt failed. Please try again or contact support.',
      },
      {
        type: NotificationType.SYSTEM,
        title: 'System Notification',
        message: 'You have a new notification from the system.',
      },
      {
        type: NotificationType.BROADCAST,
        title: 'Announcement',
        message: 'Important announcement for all users.',
      },
      {
        type: NotificationType.ORDER_UPDATED,
        title: 'New Order Update',
        message:
          'We have an update on your recent order. Check your dashboard for details.',
      },
      {
        type: NotificationType.PAYMENT_SUCCESS,
        title: 'Payment Received',
        message: 'Thank you! Your payment has been received and confirmed.',
      },
      {
        type: NotificationType.SYSTEM,
        title: 'Account Update',
        message: 'Your account settings have been updated successfully.',
      },
      {
        type: NotificationType.ORDER_UPDATED,
        title: 'Order Completed',
        message:
          'Great news! Your order has been completed. Thank you for your business!',
      },
      {
        type: NotificationType.BROADCAST,
        title: 'New Feature Available',
        message:
          'Check out our new features! Visit your dashboard to learn more.',
      },
    ];

    const userIds = Array.from({ length: 10 }, (_, i) => 101 + i);
    const getRandomUserId = (): number => {
      return userIds[Math.floor(Math.random() * userIds.length)];
    };

    const notifications: Partial<Notification>[] = [];

    for (let i = 0; i < 30; i++) {
      const template =
        notificationTemplates[
          Math.floor(Math.random() * notificationTemplates.length)
        ];
      const type = getRandomType();
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      const read = isRead;
      const readAt = getReadAt(read, createdAt);

      notifications.push({
        userId: getRandomUserId(),
        type: type,
        title: template.title,
        message: template.message,
        data: getRandomTypeData(type),
        isRead: read,
        readAt: readAt,
        isDeleted: false,
      });
    }

    await notificationRepository.save(notifications);
    this.logger.log('Notifications seeded successfully');
  }
}
