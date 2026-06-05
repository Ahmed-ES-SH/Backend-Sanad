import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Service } from './schema/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ReorderServicesDto } from './dto/reorder-services.dto';
import { ServicesPaginationQueryDto } from './dto/services-pagination-query.dto';
import { PaginationDto, PaginationMetaDto } from 'src/DTO/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  /**
   * Generates a URL-friendly slug from a title string.
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Ensures a slug is unique by appending a numeric suffix if needed.
   */
  private async ensureUniqueSlug(slug: string): Promise<string> {
    const existing = await this.serviceRepository.findOne({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    let counter = 1;
    let newSlug: string;
    do {
      newSlug = `${slug}-${counter}`;
      counter++;
    } while (
      await this.serviceRepository.findOne({ where: { slug: newSlug } })
    );

    return newSlug;
  }

  /**
   * Finds a service by ID or throws NotFoundException.
   */
  async findOneOrFail(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }
    return service;
  }

  /**
   * Creates a new service with auto-generated unique slug.
   * Service starts as unpublished with order 0.
   */
  async create(dto: CreateServiceDto): Promise<Service> {
    const baseSlug = this.generateSlug(dto.title);
    const uniqueSlug = await this.ensureUniqueSlug(baseSlug);

    const newService = this.serviceRepository.create({
      ...dto,
      slug: uniqueSlug,
      isPublished: false,
      order: 0,
    });

    return this.serviceRepository.save(newService);
  }

  /**
   * Updates an existing service. Regenerates slug if title changed.
   */
  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOneOrFail(id);

    if (dto.title && dto.title !== service.title) {
      const baseSlug = this.generateSlug(dto.title);
      service.slug = await this.ensureUniqueSlug(baseSlug);
    }

    // Explicit field mapping for type safety
    if (dto.title !== undefined) {
      service.title = dto.title;
    }
    if (dto.shortDescription !== undefined) {
      service.shortDescription = dto.shortDescription;
    }
    if (dto.longDescription !== undefined) {
      service.longDescription = dto.longDescription;
    }
    if (dto.iconUrl !== undefined) {
      service.iconUrl = dto.iconUrl;
    }
    if (dto.coverImageUrl !== undefined) {
      service.coverImageUrl = dto.coverImageUrl;
    }
    if (dto.categoryId !== undefined) {
      service.categoryId = dto.categoryId;
    }
    if (dto.basePrice !== undefined) {
      service.basePrice = dto.basePrice;
    }

    return this.serviceRepository.save(service);
  }

  /**
   * Deletes a service by ID.
   * Note: Image purge is deferred to Media module integration.
   */
  async remove(id: string): Promise<{ message: string }> {
    // Prevent deletion if total services count is less than 5
    const totalCount = await this.serviceRepository.count();
    if (totalCount < 5) {
      throw new BadRequestException(
        'Cannot delete service when total count is less than 5',
      );
    }

    await this.findOneOrFail(id);
    await this.serviceRepository.delete(id);
    return { message: 'Service deleted successfully' };
  }

  /**
   * Toggles the publish status of a service.
   * Validates required fields before allowing publish.
   */
  async togglePublish(
    id: string,
  ): Promise<{ id: string; isPublished: boolean; message: string }> {
    const service = await this.findOneOrFail(id);

    if (!service.isPublished) {
      if (!service.title || !service.shortDescription) {
        throw new BadRequestException(
          'Service must have a title and short description before publishing',
        );
      }
    }

    service.isPublished = !service.isPublished;
    await this.serviceRepository.save(service);

    return {
      id: service.id,
      isPublished: service.isPublished,
      message: service.isPublished
        ? 'Service published successfully'
        : 'Service unpublished successfully',
    };
  }

  /**
   * Batch-reorders services atomically using a transaction.
   */
  async reorder(dto: ReorderServicesDto): Promise<{ message: string }> {
    await this.serviceRepository.manager.transaction(async (manager) => {
      for (const item of dto.items) {
        await manager.update(Service, { id: item.id }, { order: item.order });
      }
    });

    return { message: 'Services reordered successfully' };
  }

  /**
   * Returns all published services sorted by order ascending.
   */
  async findPublished(query: ServicesPaginationQueryDto): Promise<{
    data: Service[];
    meta: PaginationMetaDto;
  }> {
    const { data: services, meta: paginationMeta } = await this.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 15,
      sortBy: 'order',
      isPublished: true,
      categoryId: query.categoryId,
    });
    return { data: services, meta: paginationMeta };
  }

  /**
   * Finds a published service by slug. Throws NotFoundException if not found or unpublished.
   */
  async findBySlug(slug: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { slug, isPublished: true },
      relations: ['category'],
    });

    if (!service) {
      throw new NotFoundException(
        `Published service with slug "${slug}" not found`,
      );
    }

    return service;
  }

  /**
   * Returns paginated list of all services with sorting.
   */
  async findAll(query: ServicesPaginationQueryDto): Promise<{
    data: Service[];
    meta: PaginationMetaDto;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      search,
      categoryId,
      isPublished,
    } = query;

    const validSortFields: (keyof Service)[] = [
      'id',
      'title',
      'slug',
      'order',
      'createdAt',
      'updatedAt',
    ];
    const safeSortBy = validSortFields.includes(sortBy)
      ? (sortBy as keyof Service)
      : 'createdAt';

    const baseWhere: FindOptionsWhere<Service> = {};

    if (categoryId) {
      baseWhere.categoryId = categoryId;
    }

    if (isPublished !== undefined) {
      baseWhere.isPublished = isPublished;
    }

    let whereCondition:
      | FindOptionsWhere<Service>
      | FindOptionsWhere<Service>[] = baseWhere;

    if (search) {
      whereCondition = [
        { ...baseWhere, title: ILike(`%${search}%`) },
        { ...baseWhere, shortDescription: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.serviceRepository.findAndCount({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      order: { [safeSortBy]: order },
      relations: ['category'],
    });

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
}
