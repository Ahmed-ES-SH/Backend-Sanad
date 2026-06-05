import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './schema/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { generateUniqueSlug } from '../common/utils/slug.util';
import { GetAllArticlesQueryDto } from './dto/find-all.dto';
import { PaginationMetaDto } from '../DTO/pagination.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {}

  /**
   * Strip HTML tags and calculate read time (200 words per minute).
   */
  private calculateReadTime(content: string): number {
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  private findOneOrFail(id: string): Promise<Article> {
    const article = this.articleRepo.findOne({ where: { id } });
    return article.then((result) => {
      if (!result) {
        throw new NotFoundException(`Article with ID "${id}" not found`);
      }
      return result;
    });
  }

  async create(dto: CreateArticleDto): Promise<Article> {
    const slug = await generateUniqueSlug(dto.title, this.articleRepo);
    const readTimeMinutes = this.calculateReadTime(dto.content);

    const article = this.articleRepo.create({
      title: dto.title,
      slug,
      content: dto.content,
      excerpt: dto.excerpt || null,
      coverImageUrl: dto.coverImageUrl || null,
      tags: dto.tags || [],
      categoryId: dto.categoryId || null,
      isPublished: false,
      publishedAt: null,
      viewsCount: 0,
      readTimeMinutes,
    });

    return this.articleRepo.save(article);
  }

  async update(id: string, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOneOrFail(id);

    if (dto.title && dto.title !== article.title) {
      article.slug = await generateUniqueSlug(dto.title, this.articleRepo, {
        excludeId: id,
      });
      article.title = dto.title;
    }

    if (dto.content && dto.content !== article.content) {
      article.readTimeMinutes = this.calculateReadTime(dto.content);
      article.content = dto.content;
    }

    if (dto.excerpt !== undefined) article.excerpt = dto.excerpt;
    if (dto.coverImageUrl !== undefined)
      article.coverImageUrl = dto.coverImageUrl;
    if (dto.tags !== undefined) article.tags = dto.tags;
    if (dto.categoryId !== undefined)
      article.categoryId = dto.categoryId || null;

    return this.articleRepo.save(article);
  }

  async togglePublish(id: string): Promise<{
    id: string;
    isPublished: boolean;
    publishedAt: Date | null;
    message: string;
  }> {
    const article = await this.findOneOrFail(id);

    if (!article.isPublished) {
      if (!article.excerpt || article.excerpt.trim().length === 0) {
        throw new BadRequestException(
          'Excerpt is required before publishing an article',
        );
      }
      article.isPublished = true;
      if (!article.publishedAt) {
        article.publishedAt = new Date();
      }
      await this.articleRepo.save(article);
      return {
        id: article.id,
        isPublished: article.isPublished,
        publishedAt: article.publishedAt,
        message: 'Article published successfully',
      };
    } else {
      article.isPublished = false;
      await this.articleRepo.save(article);
      return {
        id: article.id,
        isPublished: article.isPublished,
        publishedAt: article.publishedAt,
        message: 'Article unpublished successfully',
      };
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    // Prevent deletion if total articles count is less than 5
    const totalCount = await this.articleRepo.count();
    if (totalCount < 5) {
      throw new BadRequestException(
        'Cannot delete article when total count is less than 5',
      );
    }

    const article = await this.findOneOrFail(id);

    if (article.coverImageUrl) {
      console.log(
        `[BlogService] Cover image purge deferred for URL: ${article.coverImageUrl}`,
      );
    }

    await this.articleRepo.remove(article);
    return { message: 'Article deleted successfully' };
  }

  async findPublished(query: GetAllArticlesQueryDto): Promise<{
    data: Partial<Article>[];
    meta: PaginationMetaDto;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.articleRepo
      .createQueryBuilder('article')
      .where('article.isPublished = :isPublished', { isPublished: true })
      .leftJoinAndSelect('article.category', 'category')
      .select([
        'article.id',
        'article.title',
        'article.slug',
        'article.excerpt',
        'article.coverImageUrl',
        'article.tags',
        'article.isPublished',
        'article.publishedAt',
        'article.readTimeMinutes',
        'article.viewsCount',
        'article.createdAt',
        'article.updatedAt',
        'category.id',
        'category.name',
        'category.slug',
      ])
      .orderBy('article.publishedAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.categoryId) {
      qb.andWhere('article.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.tag) {
      qb.andWhere(':tag = ANY(article.tags)', {
        tag: query.tag.toLowerCase(),
      });
    }

    if (query?.search) {
      qb.andWhere('article.title ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();

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

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepo.findOne({
      where: { slug, isPublished: true },
      relations: ['category'],
    });

    if (!article) {
      throw new NotFoundException(
        `Published article with slug "${slug}" not found`,
      );
    }

    await this.articleRepo.increment({ id: article.id }, 'viewsCount', 1);

    article.viewsCount += 1;
    return article;
  }

  async findById(id: string): Promise<Article> {
    const article = await this.articleRepo.findOne({
      where: { id, isPublished: true },
      relations: ['category'],
    });

    if (!article) {
      throw new NotFoundException(
        `Published article with id "${id}" not found`,
      );
    }

    await this.articleRepo.increment({ id: article.id }, 'viewsCount', 1);

    article.viewsCount += 1;
    return article;
  }

  async findAll(query: GetAllArticlesQueryDto): Promise<{
    data: Partial<Article>[];
    meta: PaginationMetaDto;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const qb = this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .orderBy(`article.${query.sortBy || 'createdAt'}`, query.order || 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query?.categoryId) {
      qb.andWhere('article.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query?.tag) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM unnest(article.tags) tag WHERE LOWER(tag) LIKE LOWER(:tag))',
        { tag: `%${query.tag}%` },
      );
    }

    if (query?.search?.trim()) {
      qb.andWhere('article.title ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }

    if (query?.isPublished !== undefined) {
      qb.andWhere('article.isPublished = :isPublished', {
        isPublished: query.isPublished,
      });
    }
    const [data, total] = await qb.getManyAndCount();

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
