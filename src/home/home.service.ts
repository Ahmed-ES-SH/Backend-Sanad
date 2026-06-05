import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../services/schema/service.schema';
import { Category } from '../categories/schema/category.schema';
import { Project } from '../portfolio/schema/project.schema';
import { Article } from '../blog/schema/article.schema';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async getHomeData() {
    const services = await this.getHomeServices();
    const categories = await this.getHomeCategories();
    const projects = await this.getHomeProjects();
    const articles = await this.getHomeArticles();
    return { ...services, ...categories, ...projects, ...articles };
  }

  private async getHomeServices() {
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .select(['service', 'category.id', 'category.name', 'category.color'])
      .where('service.isPublished = :isPublished', { isPublished: true })
      .take(6)
      .getMany();
    return { services };
  }

  private async getHomeArticles() {
    const articles = await this.articleRepository.find({
      where: { isPublished: true },
      take: 6,
      relations: ['category'],
    });
    return { articles };
  }

  private async getHomeCategories() {
    const categories = await this.categoryRepository.find({
      take: 6,
    });
    return { categories };
  }

  private async getHomeProjects() {
    const projects = await this.projectRepository.find({
      where: { isPublished: true },
      take: 8,
      relations: ['category'],
    });
    return { projects };
  }
}
