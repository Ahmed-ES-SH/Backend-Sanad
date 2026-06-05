import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { Service } from '../services/schema/service.schema';
import { Category } from '../categories/schema/category.schema';
import { Project } from '../portfolio/schema/project.schema';
import { Article } from '../blog/schema/article.schema';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Category, Project, Article])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
