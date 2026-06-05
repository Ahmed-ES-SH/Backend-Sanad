import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';
import { CategorySeeder } from './category.seeder';

async function runReseed(): Promise<void> {
  const dataSource = new DataSource({
    ...databaseConfig,
    logging: false,
  });

  const categorySeeder = new CategorySeeder(dataSource);

  console.log('========================================');
  console.log('Starting Categories Re-seed (in-place)...');
  console.log('========================================\n');

  try {
    await dataSource.initialize();
    console.log('Database connection established\n');

    await categorySeeder.reseed();

    console.log('\n========================================');
    console.log('Categories re-seed completed!');
    console.log('========================================');
  } catch (error) {
    console.error('Error re-seeding categories:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

runReseed();
