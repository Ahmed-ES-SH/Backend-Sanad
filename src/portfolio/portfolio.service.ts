import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Project } from './schema/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ReorderProjectsDto } from './dto/reorder-projects.dto';
import { FilterProjectsQueryDto } from './dto/filter-projects-query.dto';
import { AdminFilterProjectsQueryDto } from './dto/admin-filter-projects-query.dto';
import { generateUniqueSlug } from '../common/utils/slug.util';
import { PaginationMetaDto } from '../DTO/pagination.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const slug = await generateUniqueSlug(dto.title, this.projectRepository);

    const project = this.projectRepository.create({
      ...dto,
      slug,
      isPublished: false,
      isFeatured: false,
      order: 0,
      images: dto.images || [],
      techStack: dto.techStack || [],
    });

    return this.projectRepository.save(project);
  }

  async findAll(
    query: AdminFilterProjectsQueryDto,
  ): Promise<{ data: Project[]; meta: PaginationMetaDto }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      categoryId,
      techStack,
      featured,
      isPublished,
      search,
    } = query;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.category', 'category');

    if (categoryId) {
      queryBuilder.andWhere('project.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('project.isFeatured = :featured', {
        featured,
      });
    }

    if (isPublished !== undefined) {
      queryBuilder.andWhere('project.isPublished = :isPublished', {
        isPublished,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(project.title ILIKE :search OR project.shortDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (techStack && techStack.length > 0) {
      // Use PostgreSQL array overlap operator (&&)
      queryBuilder.andWhere('project.techStack && :techStack', { techStack });
    }

    queryBuilder
      .orderBy(`project.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOneOrFail(id);

    if (dto.title && dto.title !== project.title) {
      project.slug = await generateUniqueSlug(
        dto.title,
        this.projectRepository,
      );
    }

    Object.assign(project, dto);

    return this.projectRepository.save(project);
  }

  async remove(id: string): Promise<{ message: string }> {
    // Prevent deletion if total projects count is less than 5
    const totalCount = await this.projectRepository.count();
    if (totalCount < 5) {
      throw new BadRequestException(
        'Cannot delete project when total count is less than 5',
      );
    }

    const project = await this.findOneOrFail(id);

    // Collect URLs for potential purge (Media module integration)
    const urlsToPurge: string[] = [];
    if (project.coverImageUrl) urlsToPurge.push(project.coverImageUrl);
    if (project.images && project.images.length > 0) {
      urlsToPurge.push(...project.images);
    }

    if (urlsToPurge.length > 0) {
      console.log(
        `[PortfolioService] Deleting project ${id}. URLs flagged for purge:`,
        urlsToPurge,
      );
    }

    await this.projectRepository.remove(project);

    return { message: 'Project deleted successfully' };
  }

  async togglePublish(
    id: string,
  ): Promise<{ id: string; isPublished: boolean; message: string }> {
    const project = await this.findOneOrFail(id);

    if (!project.isPublished && !project.coverImageUrl) {
      throw new BadRequestException(
        'Cannot publish a project without a cover image',
      );
    }

    project.isPublished = !project.isPublished;
    await this.projectRepository.save(project);

    return {
      id: project.id,
      isPublished: project.isPublished,
      message: `Project ${project.isPublished ? 'published' : 'unpublished'} successfully`,
    };
  }

  async toggleFeatured(
    id: string,
  ): Promise<{ id: string; isFeatured: boolean; message: string }> {
    const project = await this.findOneOrFail(id);

    if (!project.isFeatured) {
      const maxFeatured = this.configService.get<number>(
        'FEATURED_PROJECTS_MAX',
        6,
      );
      const featuredCount = await this.projectRepository.count({
        where: { isFeatured: true },
      });

      if (featuredCount >= maxFeatured) {
        throw new BadRequestException(
          `Maximum of ${maxFeatured} featured projects reached`,
        );
      }
    }

    project.isFeatured = !project.isFeatured;
    await this.projectRepository.save(project);

    return {
      id: project.id,
      isFeatured: project.isFeatured,
      message: `Project ${project.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    };
  }

  async reorder(dto: ReorderProjectsDto): Promise<{ message: string }> {
    await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Project);
      for (const item of dto.items) {
        await repository.update(item.id, { order: item.order });
      }
    });

    return { message: 'Projects reordered successfully' };
  }

  async findPublished(filters: FilterProjectsQueryDto): Promise<{
    data: Project[];
    meta: PaginationMetaDto;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.category', 'category')
      .where('project.isPublished = :isPublished', { isPublished: true });

    if (filters.categoryId) {
      queryBuilder.andWhere('project.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.featured !== undefined) {
      queryBuilder.andWhere('project.isFeatured = :isFeatured', {
        isFeatured: filters.featured,
      });
    }

    if (filters.techStack && filters.techStack.length > 0) {
      queryBuilder.andWhere('project.techStack && :techStack', {
        techStack: filters.techStack,
      });
    }

    queryBuilder.orderBy('project.order', 'ASC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  async findBySlug(slug: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { slug, isPublished: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }

    return project;
  }

  async findOne(id: string): Promise<Project> {
    return this.findOneOrFail(id);
  }

  private async findOneOrFail(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }
}
