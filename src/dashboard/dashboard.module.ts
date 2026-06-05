import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ServiceEntity } from './entities/service.entity';
import { ProjectEntity } from './entities/project.entity';
import { ArticleEntity } from './entities/article.entity';
import { ContactMessageEntity } from './entities/contact-message.entity';
import { PaymentEntity } from './entities/payment.entity';
import { User } from '../user/schema/user.schema';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceEntity,
      ProjectEntity,
      ArticleEntity,
      ContactMessageEntity,
      PaymentEntity,
      User,
    ]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, AuthGuard],
})
export class DashboardModule {}
