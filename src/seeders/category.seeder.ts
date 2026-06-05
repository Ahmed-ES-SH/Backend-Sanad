import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Category } from '../categories/schema/category.schema';

@Injectable()
export class CategorySeeder {
  private readonly logger = new Logger(CategorySeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  private readonly categoriesData: Partial<Category>[] = [
    {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Web development projects and tutorials',
      color: '#3B82F6',
      icon: 'FaGlobe',
      order: 1,
    },
    {
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'Mobile app development projects',
      color: '#10B981',
      icon: 'FaMobileAlt',
      order: 2,
    },
    {
      name: 'UI/UX Design',
      slug: 'ui-ux-design',
      description: 'UI/UX design projects and resources',
      color: '#8B5CF6',
      icon: 'FaPaintBrush',
      order: 3,
    },
    {
      name: 'DevOps',
      slug: 'devops',
      description: 'DevOps and cloud infrastructure',
      color: '#F59E0B',
      icon: 'FaCloud',
      order: 4,
    },
    {
      name: 'Data Science',
      slug: 'data-science',
      description: 'Data science and machine learning',
      color: '#EF4444',
      icon: 'FaChartBar',
      order: 5,
    },
    {
      name: 'Cybersecurity',
      slug: 'cybersecurity',
      description: 'Security auditing and penetration testing',
      color: '#DC2626',
      icon: 'FaShieldAlt',
      order: 6,
    },
    {
      name: 'Blockchain',
      slug: 'blockchain',
      description: 'Blockchain and cryptocurrency development',
      color: '#F97316',
      icon: 'FaLink',
      order: 7,
    },
    {
      name: 'Game Development',
      slug: 'game-development',
      description: 'Video game design and development',
      color: '#7C3AED',
      icon: 'FaGamepad',
      order: 8,
    },
    {
      name: 'IoT',
      slug: 'iot',
      description: 'Internet of Things and embedded systems',
      color: '#06B6D4',
      icon: 'FaMicrochip',
      order: 9,
    },
    {
      name: 'Cloud Computing',
      slug: 'cloud-computing',
      description: 'Cloud platforms and serverless architectures',
      color: '#0EA5E9',
      icon: 'FaCloudUploadAlt',
      order: 10,
    },
    {
      name: 'API Development',
      slug: 'api-development',
      description: 'RESTful and GraphQL API design',
      color: '#14B8A6',
      icon: 'FaServer',
      order: 11,
    },
    {
      name: 'E-Commerce',
      slug: 'e-commerce',
      description: 'Online store and payment solutions',
      color: '#84CC16',
      icon: 'FaShoppingCart',
      order: 12,
    },
    {
      name: 'CMS',
      slug: 'cms',
      description: 'Content management systems',
      color: '#A3E635',
      icon: 'FaFileAlt',
      order: 13,
    },
    {
      name: 'Testing & QA',
      slug: 'testing-qa',
      description: 'Software testing and quality assurance',
      color: '#FBBF24',
      icon: 'FaCheckCircle',
      order: 14,
    },
    {
      name: 'Performance',
      slug: 'performance',
      description: 'Performance optimization and monitoring',
      color: '#FB923C',
      icon: 'FaBolt',
      order: 15,
    },
    {
      name: 'Accessibility',
      slug: 'accessibility',
      description: 'Web accessibility and inclusive design',
      color: '#4ADE80',
      icon: 'FaEye',
      order: 16,
    },
    {
      name: 'SEO',
      slug: 'seo',
      description: 'Search engine optimization techniques',
      color: '#34D399',
      icon: 'FaSearch',
      order: 17,
    },
    {
      name: 'Microservices',
      slug: 'microservices',
      description: 'Microservice architecture patterns',
      color: '#60A5FA',
      icon: 'FaLayerGroup',
      order: 18,
    },
    {
      name: 'Serverless',
      slug: 'serverless',
      description: 'Serverless computing and FaaS',
      color: '#A78BFA',
      icon: 'FaCode',
      order: 19,
    },
    {
      name: 'Progressive Web Apps',
      slug: 'progressive-web-apps',
      description: 'PWA development and service workers',
      color: '#F472B6',
      icon: 'FaWifi',
      order: 20,
    },
    {
      name: 'AR/VR',
      slug: 'ar-vr',
      description: 'Augmented and virtual reality experiences',
      color: '#E879F9',
      icon: 'FaGlasses',
      order: 21,
    },
    {
      name: 'Machine Learning',
      slug: 'machine-learning',
      description: 'ML models and AI integration',
      color: '#C084FC',
      icon: 'FaBrain',
      order: 22,
    },
    {
      name: 'Natural Language Processing',
      slug: 'nlp',
      description: 'Text analysis and language models',
      color: '#818CF8',
      icon: 'FaCommentAlt',
      order: 23,
    },
    {
      name: 'Computer Vision',
      slug: 'computer-vision',
      description: 'Image recognition and processing',
      color: '#6366F1',
      icon: 'FaCamera',
      order: 24,
    },
    {
      name: 'Database Design',
      slug: 'database-design',
      description: 'Database architecture and optimization',
      color: '#22D3EE',
      icon: 'FaDatabase',
      order: 25,
    },
    {
      name: 'Frontend Frameworks',
      slug: 'frontend-frameworks',
      description: 'React, Vue, Angular and more',
      color: '#2DD4BF',
      icon: 'FaThLarge',
      order: 26,
    },
    {
      name: 'Backend Frameworks',
      slug: 'backend-frameworks',
      description: 'NestJS, Express, Django and more',
      color: '#38BDF8',
      icon: 'FaTerminal',
      order: 27,
    },
    {
      name: 'System Design',
      slug: 'system-design',
      description: 'Scalable system architecture patterns',
      color: '#A3E635',
      icon: 'FaProjectDiagram',
      order: 28,
    },
    {
      name: 'Open Source',
      slug: 'open-source',
      description: 'Open source projects and contributions',
      color: '#FACC15',
      icon: 'FaGithub',
      order: 29,
    },
    {
      name: 'Freelancing',
      slug: 'freelancing',
      description: 'Freelance tips and best practices',
      color: '#F87171',
      icon: 'FaBriefcase',
      order: 30,
    },
    {
      name: 'Career Development',
      slug: 'career-development',
      description: 'Professional growth and skill building',
      color: '#FB7185',
      icon: 'FaChartLine',
      order: 31,
    },
  ];

  async seed(): Promise<void> {
    const categoryRepository = this.dataSource.getRepository(Category);

    const existingCategories = await categoryRepository.count();
    if (existingCategories > 0) {
      this.logger.log('Categories already seeded, skipping...');
      return;
    }

    await categoryRepository.save(this.categoriesData);
    this.logger.log('Categories seeded successfully');
  }

  async reseed(): Promise<void> {
    const categoryRepository = this.dataSource.getRepository(Category);

    this.logger.log('Re-seeding categories (upsert by slug)...');

    let updated = 0;
    let inserted = 0;
    let skipped = 0;

    for (const cat of this.categoriesData) {
      const existing = await categoryRepository.findOne({
        where: { slug: cat.slug },
      });

      if (existing) {
        const result = await categoryRepository.update(
          { slug: cat.slug },
          {
            name: cat.name,
            description: cat.description,
            color: cat.color,
            icon: cat.icon,
            order: cat.order,
          },
        );
        if (result.affected && result.affected > 0) {
          updated++;
        } else {
          skipped++;
        }
      } else {
        await categoryRepository.save(cat);
        inserted++;
      }
    }

    this.logger.log(
      `Re-seed complete. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`,
    );
  }
}
