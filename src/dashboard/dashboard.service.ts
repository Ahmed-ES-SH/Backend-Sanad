import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceEntity } from './entities/service.entity';
import { ProjectEntity } from './entities/project.entity';
import { ArticleEntity } from './entities/article.entity';
import { ContactMessageEntity } from './entities/contact-message.entity';
import { PaymentEntity } from './entities/payment.entity';
import { User } from '../user/schema/user.schema';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepo: Repository<ServiceEntity>,

    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,

    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,

    @InjectRepository(ContactMessageEntity)
    private readonly contactMessageRepo: Repository<ContactMessageEntity>,

    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [
      projectStats,
      articleStats,
      serviceStats,
      messageStats,
      paymentStats,
      userStats,
    ] = await Promise.all([
      this.getProjectStats(),
      this.getArticleStats(),
      this.getServiceStats(),
      this.getMessageStats(),
      this.getPaymentStats(),
      this.getUserStats(),
    ]);

    const errors: string[] = [
      ...projectStats.errors,
      ...articleStats.errors,
      ...serviceStats.errors,
      ...messageStats.errors,
      ...paymentStats.errors,
      ...userStats.errors,
    ];

    const result: DashboardStatsDto = {
      totalProjects: projectStats.totalProjects,
      publishedProjects: projectStats.publishedProjects,
      totalArticles: articleStats.totalArticles,
      publishedArticles: articleStats.publishedArticles,
      totalServices: serviceStats.totalServices,
      publishedServices: serviceStats.publishedServices,
      unreadMessages: messageStats.unreadMessages,
      totalPayments: paymentStats.totalPayments,
      totalRevenue: paymentStats.totalRevenue,
      totalUsers: userStats.totalUsers,
    };

    if (errors.length > 0) {
      result.errors = errors;
    }

    return result;
  }

  private async getProjectStats(): Promise<{
    totalProjects: number;
    publishedProjects: number;
    errors: string[];
  }> {
    try {
      const [totalProjects, publishedProjects] = await Promise.all([
        this.projectRepo.count(),
        this.projectRepo.count({ where: { isPublished: true } }),
      ]);
      return { totalProjects, publishedProjects, errors: [] };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        totalProjects: 0,
        publishedProjects: 0,
        errors: [`projects: ${message}`],
      };
    }
  }

  private async getArticleStats(): Promise<{
    totalArticles: number;
    publishedArticles: number;
    errors: string[];
  }> {
    try {
      const [totalArticles, publishedArticles] = await Promise.all([
        this.articleRepo.count(),
        this.articleRepo.count({ where: { isPublished: true } }),
      ]);
      return { totalArticles, publishedArticles, errors: [] };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        totalArticles: 0,
        publishedArticles: 0,
        errors: [`articles: ${message}`],
      };
    }
  }

  private async getServiceStats(): Promise<{
    totalServices: number;
    publishedServices: number;
    errors: string[];
  }> {
    try {
      const [totalServices, publishedServices] = await Promise.all([
        this.serviceRepo.count(),
        this.serviceRepo.count({ where: { isPublished: true } }),
      ]);
      return { totalServices, publishedServices, errors: [] };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        totalServices: 0,
        publishedServices: 0,
        errors: [`services: ${message}`],
      };
    }
  }

  private async getMessageStats(): Promise<{
    unreadMessages: number;
    errors: string[];
  }> {
    try {
      const unreadMessages = await this.contactMessageRepo.count({
        where: { isRead: false },
      });
      return { unreadMessages, errors: [] };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return { unreadMessages: 0, errors: [`messages: ${message}`] };
    }
  }

  private async getPaymentStats(): Promise<{
    totalPayments: number;
    totalRevenue: number;
    errors: string[];
  }> {
    try {
      const totalPayments = await this.paymentRepo.count();

      const revenueResult = await this.paymentRepo
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'totalRevenue')
        .where('payment.status = :status', { status: 'succeeded' })
        .getRawOne();

      const totalRevenue = parseFloat(revenueResult?.totalRevenue ?? '0');

      return { totalPayments, totalRevenue, errors: [] };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        totalPayments: 0,
        totalRevenue: 0,
        errors: [`payments: ${message}`],
      };
    }
  }

  private async getUserStats(): Promise<{
    totalUsers: number;
    errors: string[];
  }> {
    try {
      const totalUsers = await this.userRepo.count();
      return { totalUsers, errors: [] };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return { totalUsers: 0, errors: [`users: ${message}`] };
    }
  }
}
