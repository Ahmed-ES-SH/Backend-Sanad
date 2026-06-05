import { User } from '../user/schema/user.schema';
import { DataSourceOptions, DataSource } from 'typeorm';
import { config } from 'dotenv';
import { BlackList } from '../auth/schema/blacklisk-tokens.schema';
import { Payment } from '../payments/schema/payment.schema';
import { Project } from '../portfolio/schema/project.schema';
import { Service } from '../services/schema/service.schema';
import { ContactMessage } from '../contact/schema/contact-message.schema';
import { Article } from '../blog/schema/article.schema';
import { Category } from '../categories/schema/category.schema';
import { Cart } from '../cart/schema/cart.schema';
import { CartItem } from '../cart/schema/cart-item.schema';
import { ServiceOrder } from '../service-orders/schema/service-order.schema';
import { OrderUpdate } from '../service-orders/schema/order-update.schema';
import { Notification } from '../notifications/schema/notification.schema';
import { NotificationPreferences } from '../notifications/schema/notification-preferences.schema';

// Config
config({ path: '.env' });

// Data Source Options
export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    BlackList,
    Service,
    ContactMessage,
    Article,
    Project,
    Payment,
    Category,
    Cart,
    CartItem,
    ServiceOrder,
    OrderUpdate,
    Notification,
    NotificationPreferences,
  ],
  synchronize: false,
  logging: false,
  migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(databaseConfig);

export default dataSource;
