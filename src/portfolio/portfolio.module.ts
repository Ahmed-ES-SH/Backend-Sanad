import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PortfolioPublicController } from './portfolio.public.controller';
import { Project } from './schema/project.schema';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), CategoriesModule],
  controllers: [PortfolioController, PortfolioPublicController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
