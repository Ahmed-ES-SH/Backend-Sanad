import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';
import { UserSeeder } from './user.seeder';
import { CategorySeeder } from './category.seeder';
import { ArticleSeeder } from './article.seeder';
import { ProjectSeeder } from './project.seeder';
import { ContactMessageSeeder } from './contact-message.seeder';
import { ServiceSeeder } from './service.seeder';
import { ServiceOrderSeeder } from './service-order.seeder';
import { OrderUpdateSeeder } from './order-update.seeder';
import { PaymentSeeder } from './payment.seeder';
import { NotificationSeeder } from './notification.seeder';

// Create data source from config
const dataSource = new DataSource({
  ...databaseConfig,
  logging: false,
});

// Initialize the seeder classes
const userSeeder = new UserSeeder(dataSource);
const categorySeeder = new CategorySeeder(dataSource);
const articleSeeder = new ArticleSeeder(dataSource);
const projectSeeder = new ProjectSeeder(dataSource);
const contactMessageSeeder = new ContactMessageSeeder(dataSource);
const serviceSeeder = new ServiceSeeder(dataSource);
const serviceOrderSeeder = new ServiceOrderSeeder(dataSource);
const orderUpdateSeeder = new OrderUpdateSeeder(dataSource);
const paymentSeeder = new PaymentSeeder(dataSource);
const notificationSeeder = new NotificationSeeder(dataSource);

async function runSeeders(force = false) {
  console.log('========================================');
  console.log('Starting Database Seeding...');
  if (force) {
    console.log('FORCE MODE: Truncating existing data...');
  }
  console.log('========================================\n');

  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('Database connection established\n');

    if (force) {
      console.log('Truncating tables...');
      // Truncate in reverse dependency order
      await dataSource.query('TRUNCATE TABLE notifications CASCADE');
      await dataSource.query('TRUNCATE TABLE payments CASCADE');
      await dataSource.query('TRUNCATE TABLE service_orders CASCADE');
      await dataSource.query('TRUNCATE TABLE contact_messages CASCADE');
      await dataSource.query('TRUNCATE TABLE services CASCADE');
      await dataSource.query('TRUNCATE TABLE projects CASCADE');
      await dataSource.query('TRUNCATE TABLE articles CASCADE');
      await dataSource.query('TRUNCATE TABLE categories CASCADE');
      await dataSource.query('TRUNCATE TABLE users CASCADE');
      console.log('Tables truncated successfully\n');
    }

    // Run seeders in order (dependencies matter)
    console.log('Seeding Categories...');
    await categorySeeder.seed();

    console.log('Seeding Users...');
    await userSeeder.seed();

    console.log('Seeding Articles...');
    await articleSeeder.seed();

    console.log('Seeding Projects...');
    await projectSeeder.seed();

    console.log('Seeding Services...');
    await serviceSeeder.seed();

    console.log('Seeding Service Orders...');
    await serviceOrderSeeder.seed();

    console.log('Seeding Order Updates...');
    await orderUpdateSeeder.seed();

    console.log('Seeding Payments...');
    await paymentSeeder.seed();

    console.log('Seeding Notifications...');
    await notificationSeeder.seed();

    console.log('Seeding Contact Messages...');
    await contactMessageSeeder.seed();

    console.log('\n========================================');
    console.log('All seeders completed successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  } finally {
    // Close the data source connection
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

// Export for use in other modules
export { dataSource, runSeeders };

// Run if executed directly
const forceFlag =
  process.argv.includes('--force') || process.argv.includes('-f');
runSeeders(forceFlag);
