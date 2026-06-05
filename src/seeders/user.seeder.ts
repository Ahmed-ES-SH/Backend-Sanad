import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../user/schema/user.schema';
import { UserRoleEnum } from '../auth/types/UserRoleEnum';
import * as argon2 from 'argon2';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      this.logger.log('Users already seeded, skipping...');
      return;
    }

    const hashedPassword = await argon2.hash('admin123', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const users: Partial<User>[] = [
      {
        email: 'admin@sanad.com',
        name: 'Sanad Admin',
        password: hashedPassword,
        role: UserRoleEnum.ADMIN,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
      {
        email: 'user@sanad.com',
        name: 'Sanad User',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      },
      {
        email: 'ahmed.hassan@sanad.com',
        name: 'Ahmed Hassan',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed',
      },
      {
        email: 'sara.ali@sanad.com',
        name: 'Sara Ali',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
      },
      {
        email: 'omar.farouk@sanad.com',
        name: 'Omar Farouk',
        password: hashedPassword,
        role: UserRoleEnum.ADMIN,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=omar',
      },
      {
        email: 'nour.elmasry@sanad.com',
        name: 'Nour Elmasry',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nour',
      },
      {
        email: 'khaled.mansour@sanad.com',
        name: 'Khaled Mansour',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khaled',
      },
      {
        email: 'fatima.zahra@sanad.com',
        name: 'Fatima Zahra',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
      },
      {
        email: 'youssef.ibrahim@sanad.com',
        name: 'Youssef Ibrahim',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=youssef',
      },
      {
        email: 'mariam.kamal@sanad.com',
        name: 'Mariam Kamal',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariam',
      },
      {
        email: 'tariq.nabil@sanad.com',
        name: 'Tariq Nabil',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tariq',
      },
      {
        email: 'layla.samir@sanad.com',
        name: 'Layla Samir',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=layla',
      },
      {
        email: 'hassan.rashid@sanad.com',
        name: 'Hassan Rashid',
        password: hashedPassword,
        role: UserRoleEnum.ADMIN,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hassan',
      },
      {
        email: 'dina.waleed@sanad.com',
        name: 'Dina Waleed',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dina',
      },
      {
        email: 'mahmoud.saleh@sanad.com',
        name: 'Mahmoud Saleh',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mahmoud',
      },
      {
        email: 'rana.hesham@sanad.com',
        name: 'Rana Hesham',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rana',
      },
      {
        email: 'amr.gamal@sanad.com',
        name: 'Amr Gamal',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amr',
      },
      {
        email: 'heba.tarek@sanad.com',
        name: 'Heba Tarek',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=heba',
      },
      {
        email: 'mostafa.adel@sanad.com',
        name: 'Mostafa Adel',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mostafa',
      },
      {
        email: 'yasmin.fathy@sanad.com',
        name: 'Yasmin Fathy',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yasmin',
      },
      {
        email: 'ibrahim.said@sanad.com',
        name: 'Ibrahim Said',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim',
      },
      {
        email: 'nada.mohamed@sanad.com',
        name: 'Nada Mohamed',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nada',
      },
      {
        email: 'walid.abdullah@sanad.com',
        name: 'Walid Abdullah',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=walid',
      },
      {
        email: 'shaimaa.hassan@sanad.com',
        name: 'Shaimaa Hassan',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shaimaa',
      },
      {
        email: 'karim.essam@sanad.com',
        name: 'Karim Essam',
        password: hashedPassword,
        role: UserRoleEnum.ADMIN,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim',
      },
      {
        email: 'mona.ramadan@sanad.com',
        name: 'Mona Ramadan',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mona',
      },
      {
        email: 'ashraf.mostafa@sanad.com',
        name: 'Ashraf Mostafa',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ashraf',
      },
      {
        email: 'salma.yasser@sanad.com',
        name: 'Salma Yasser',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=salma',
      },
      {
        email: 'mohamed.nour@sanad.com',
        name: 'Mohamed Nour',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mohamed',
      },
      {
        email: 'reem.abdelrahman@sanad.com',
        name: 'Reem Abdelrahman',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=reem',
      },
      {
        email: 'hany.sobhy@sanad.com',
        name: 'Hany Sobhy',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hany',
      },
      {
        email: 'mai.elsherbiny@sanad.com',
        name: 'Mai Elsherbiny',
        password: hashedPassword,
        role: UserRoleEnum.USER,
        isEmailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai',
      },
    ];

    await userRepository.save(users);
    this.logger.log('Users seeded successfully');
  }
}
