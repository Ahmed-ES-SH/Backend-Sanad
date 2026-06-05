import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Article } from '../blog/schema/article.schema';
import { Category } from '../categories/schema/category.schema';

@Injectable()
export class ArticleSeeder {
  private readonly logger = new Logger(ArticleSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const articleRepository = this.dataSource.getRepository(Article);
    const categoryRepository = this.dataSource.getRepository(Category);

    const existingArticles = await articleRepository.count();
    if (existingArticles > 0) {
      this.logger.log('Articles already seeded, skipping...');
      return;
    }

    const categories = await categoryRepository.find();
    if (categories.length === 0) {
      this.logger.warn('No categories found, please seed categories first');
      return;
    }

    const getCategory = (slug: string): string => {
      const cat = categories.find((c) => c.slug === slug);
      return cat ? cat.id : categories[0].id;
    };

    const articles: Partial<Article>[] = [
      {
        title: 'Getting Started with NestJS',
        slug: 'getting-started-with-nestjs',
        excerpt:
          'Learn how to build scalable backend applications with NestJS framework.',
        content:
          'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. It uses TypeScript and combines elements of OOP, FP, and FRP.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        tags: ['nestjs', 'typescript', 'backend', 'nodejs'],
        categoryId: getCategory('backend-frameworks'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 5,
        viewsCount: 150,
      },
      {
        title: 'Building RESTful APIs with TypeORM',
        slug: 'building-restful-apis-with-typeorm',
        excerpt:
          'Master database operations with TypeORM in your NestJS applications.',
        content:
          'TypeORM is a powerful ORM that supports many databases including PostgreSQL, MySQL, and SQLite. In this guide, we explore how to use TypeORM with NestJS.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
        tags: ['typeorm', 'database', 'postgresql', 'tutorial'],
        categoryId: getCategory('database-design'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 8,
        viewsCount: 89,
      },
      {
        title: 'React Hooks Deep Dive',
        slug: 'react-hooks-deep-dive',
        excerpt:
          'Understand React Hooks and how to use them effectively in your components.',
        content:
          'React Hooks are functions that let you use state and other React features without writing a class. They were introduced in React 16.8 and revolutionized how we write components.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        tags: ['react', 'hooks', 'frontend', 'javascript'],
        categoryId: getCategory('frontend-frameworks'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 6,
        viewsCount: 234,
      },
      {
        title: 'Understanding Docker Containers',
        slug: 'understanding-docker-containers',
        excerpt: 'Learn the fundamentals of Docker and containerization.',
        content:
          'Docker is a platform for developing, shipping, and running applications in containers. Containers are lightweight and include everything needed to run the software.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800',
        tags: ['docker', 'devops', 'containers', 'deployment'],
        categoryId: getCategory('devops'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 7,
        viewsCount: 176,
      },
      {
        title: 'Machine Learning Basics with Python',
        slug: 'machine-learning-basics-python',
        excerpt:
          'Get started with machine learning using Python and scikit-learn.',
        content:
          'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience. Python is the most popular language for ML.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        tags: ['machine-learning', 'python', 'ai', 'data-science'],
        categoryId: getCategory('machine-learning'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 10,
        viewsCount: 312,
      },
      {
        title: 'Securing Your API with JWT',
        slug: 'securing-api-with-jwt',
        excerpt: 'Implement JSON Web Token authentication in your REST APIs.',
        content:
          'JWT (JSON Web Tokens) provide a compact and self-contained way to transmit information between parties. Learn how to implement secure authentication.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        tags: ['jwt', 'security', 'authentication', 'api'],
        categoryId: getCategory('cybersecurity'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 9,
        viewsCount: 198,
      },
      {
        title: 'Building a Blockchain from Scratch',
        slug: 'building-blockchain-from-scratch',
        excerpt:
          'Understand blockchain technology by building one in TypeScript.',
        content:
          'Blockchain is a distributed ledger technology that powers cryptocurrencies. By building one from scratch, you gain deep understanding of how it works.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        tags: ['blockchain', 'cryptocurrency', 'typescript', 'tutorial'],
        categoryId: getCategory('blockchain'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 12,
        viewsCount: 267,
      },
      {
        title: 'Unity Game Development for Beginners',
        slug: 'unity-game-development-beginners',
        excerpt: 'Start your game development journey with Unity and C#.',
        content:
          'Unity is one of the most popular game engines in the world. It supports 2D and 3D game development across multiple platforms.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        tags: ['unity', 'game-dev', 'csharp', 'beginner'],
        categoryId: getCategory('game-development'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 8,
        viewsCount: 145,
      },
      {
        title: 'IoT with Raspberry Pi and Node.js',
        slug: 'iot-raspberry-pi-nodejs',
        excerpt:
          'Connect physical devices to the web using Raspberry Pi and Node.js.',
        content:
          'The Internet of Things connects everyday objects to the internet. Learn how to use Raspberry Pi with Node.js to build IoT projects.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1553406830-ef2513052d77?w=800',
        tags: ['iot', 'raspberry-pi', 'nodejs', 'embedded'],
        categoryId: getCategory('iot'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 11,
        viewsCount: 189,
      },
      {
        title: 'AWS Lambda: Serverless Computing',
        slug: 'aws-lambda-serverless-computing',
        excerpt: 'Build and deploy serverless functions with AWS Lambda.',
        content:
          'AWS Lambda lets you run code without provisioning servers. Pay only for the compute time you consume with automatic scaling.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        tags: ['aws', 'lambda', 'serverless', 'cloud'],
        categoryId: getCategory('serverless'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 7,
        viewsCount: 156,
      },
      {
        title: 'GraphQL vs REST: Choosing the Right API',
        slug: 'graphql-vs-rest-choosing-right-api',
        excerpt:
          'Compare GraphQL and REST to make the best API design decision.',
        content:
          'Both GraphQL and REST have their strengths. Understanding when to use each is crucial for building efficient APIs.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        tags: ['graphql', 'rest', 'api', 'architecture'],
        categoryId: getCategory('api-development'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 6,
        viewsCount: 278,
      },
      {
        title: 'Building an E-Commerce Store with Stripe',
        slug: 'building-ecommerce-store-stripe',
        excerpt: 'Integrate Stripe payments into your online store.',
        content:
          'Stripe provides powerful payment processing APIs. Learn how to build a complete e-commerce checkout flow.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        tags: ['stripe', 'ecommerce', 'payments', 'tutorial'],
        categoryId: getCategory('e-commerce'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 10,
        viewsCount: 203,
      },
      {
        title: 'Headless CMS with Strapi',
        slug: 'headless-cms-with-strapi',
        excerpt: 'Build a flexible content management system with Strapi.',
        content:
          'Strapi is an open-source headless CMS that gives developers the freedom to use their favorite tools and frameworks.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        tags: ['strapi', 'cms', 'headless', 'content'],
        categoryId: getCategory('cms'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 8,
        viewsCount: 134,
      },
      {
        title: 'Writing Effective Unit Tests with Jest',
        slug: 'writing-effective-unit-tests-jest',
        excerpt: 'Master unit testing strategies using the Jest framework.',
        content:
          'Jest is a delightful JavaScript testing framework with a focus on simplicity. Learn testing best practices.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        tags: ['jest', 'testing', 'unit-tests', 'quality'],
        categoryId: getCategory('testing-qa'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 7,
        viewsCount: 167,
      },
      {
        title: 'Web Performance Optimization Techniques',
        slug: 'web-performance-optimization-techniques',
        excerpt: 'Speed up your website with proven optimization strategies.',
        content:
          'Web performance directly impacts user experience and SEO. Learn techniques to make your site blazing fast.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        tags: ['performance', 'optimization', 'web-vitals', 'speed'],
        categoryId: getCategory('performance'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 9,
        viewsCount: 245,
      },
      {
        title: 'WCAG Accessibility Guidelines Explained',
        slug: 'wcag-accessibility-guidelines-explained',
        excerpt: 'Make your web applications accessible to everyone.',
        content:
          'Web accessibility ensures that websites and web applications are perceivable, operable, understandable, and robust for all users.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
        tags: ['accessibility', 'wcag', 'inclusive', 'a11y'],
        categoryId: getCategory('accessibility'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 8,
        viewsCount: 112,
      },
      {
        title: 'SEO Best Practices for 2024',
        slug: 'seo-best-practices-2024',
        excerpt: 'Stay ahead with the latest SEO strategies and techniques.',
        content:
          'Search engine optimization continues to evolve. Learn the latest techniques to rank higher in search results.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1572177215150-f99da4470e63?w=800',
        tags: ['seo', 'search', 'ranking', 'optimization'],
        categoryId: getCategory('seo'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 6,
        viewsCount: 289,
      },
      {
        title: 'Microservices Communication Patterns',
        slug: 'microservices-communication-patterns',
        excerpt: 'Learn how microservices communicate in distributed systems.',
        content:
          'Microservices need to communicate effectively. Explore synchronous and asynchronous communication patterns.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        tags: ['microservices', 'architecture', 'distributed', 'patterns'],
        categoryId: getCategory('microservices'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 11,
        viewsCount: 198,
      },
      {
        title: 'Progressive Web Apps: The Future of Web',
        slug: 'progressive-web-apps-future-of-web',
        excerpt: 'Build PWAs that deliver native-like experiences on the web.',
        content:
          'Progressive Web Apps combine the best of web and mobile apps. They are reliable, fast, and engaging.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        tags: ['pwa', 'service-workers', 'offline', 'mobile'],
        categoryId: getCategory('progressive-web-apps'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 7,
        viewsCount: 176,
      },
      {
        title: 'Building AR Experiences with WebXR',
        slug: 'building-ar-experiences-webxr',
        excerpt:
          'Create augmented reality experiences directly in the browser.',
        content:
          'WebXR API enables immersive augmented and virtual reality experiences on the web without requiring native apps.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
        tags: ['ar', 'vr', 'webxr', 'immersive'],
        categoryId: getCategory('ar-vr'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 9,
        viewsCount: 143,
      },
      {
        title: 'Natural Language Processing with Transformers',
        slug: 'nlp-with-transformers',
        excerpt: 'Explore modern NLP using transformer architectures.',
        content:
          'Transformers have revolutionized natural language processing. Learn how models like BERT and GPT work.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        tags: ['nlp', 'transformers', 'ai', 'deep-learning'],
        categoryId: getCategory('nlp'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 12,
        viewsCount: 267,
      },
      {
        title: 'Computer Vision with OpenCV',
        slug: 'computer-vision-with-opencv',
        excerpt: 'Process and analyze images using OpenCV and Python.',
        content:
          'OpenCV is the most popular computer vision library. Learn image processing, object detection, and more.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
        tags: ['opencv', 'computer-vision', 'python', 'image-processing'],
        categoryId: getCategory('computer-vision'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 10,
        viewsCount: 189,
      },
      {
        title: 'PostgreSQL Performance Tuning',
        slug: 'postgresql-performance-tuning',
        excerpt: 'Optimize your PostgreSQL database for maximum performance.',
        content:
          'PostgreSQL is a powerful open-source database. Learn how to tune it for optimal performance in production.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
        tags: ['postgresql', 'database', 'performance', 'tuning'],
        categoryId: getCategory('database-design'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 8,
        viewsCount: 156,
      },
      {
        title: 'Vue.js 3 Composition API Guide',
        slug: 'vuejs-3-composition-api-guide',
        excerpt:
          'Master the Vue.js 3 Composition API for better code organization.',
        content:
          'The Composition API in Vue 3 provides a more flexible way to organize component logic using functions.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        tags: ['vue', 'composition-api', 'frontend', 'javascript'],
        categoryId: getCategory('frontend-frameworks'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 7,
        viewsCount: 134,
      },
      {
        title: 'System Design: Load Balancing Strategies',
        slug: 'system-design-load-balancing-strategies',
        excerpt:
          'Distribute traffic effectively with load balancing techniques.',
        content:
          'Load balancing is essential for scalable systems. Explore different algorithms and strategies for distributing traffic.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        tags: [
          'system-design',
          'load-balancing',
          'scalability',
          'architecture',
        ],
        categoryId: getCategory('system-design'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 9,
        viewsCount: 223,
      },
      {
        title: 'Contributing to Open Source: A Complete Guide',
        slug: 'contributing-to-open-source-guide',
        excerpt: 'Learn how to make your first open source contribution.',
        content:
          'Open source contributions can boost your career and help the community. Here is a complete guide to getting started.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        tags: ['open-source', 'github', 'contributing', 'community'],
        categoryId: getCategory('open-source'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 6,
        viewsCount: 178,
      },
      {
        title: 'Freelancing as a Developer: Tips for Success',
        slug: 'freelancing-developer-tips-success',
        excerpt: 'Navigate the freelance developer world with confidence.',
        content:
          'Freelancing offers freedom and flexibility. Learn how to find clients, price your work, and manage projects effectively.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        tags: ['freelancing', 'developer', 'business', 'tips'],
        categoryId: getCategory('freelancing'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 8,
        viewsCount: 245,
      },
      {
        title: 'Building a Tech Career: Roadmap for 2024',
        slug: 'building-tech-career-roadmap-2024',
        excerpt: 'Plan your technology career with this comprehensive roadmap.',
        content:
          'The tech industry offers incredible opportunities. Learn how to build a successful career path in software development.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        tags: ['career', 'development', 'roadmap', 'tech'],
        categoryId: getCategory('career-development'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 7,
        viewsCount: 312,
      },
      {
        title: 'Kubernetes for Beginners',
        slug: 'kubernetes-for-beginners',
        excerpt: 'Understand container orchestration with Kubernetes.',
        content:
          'Kubernetes is the industry standard for container orchestration. Learn the fundamentals of pods, services, and deployments.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800',
        tags: ['kubernetes', 'devops', 'containers', 'orchestration'],
        categoryId: getCategory('devops'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 11,
        viewsCount: 198,
      },
      {
        title: 'Smart Contract Development with Solidity',
        slug: 'smart-contract-development-solidity',
        excerpt: 'Write and deploy smart contracts on the Ethereum blockchain.',
        content:
          'Solidity is the primary language for Ethereum smart contracts. Learn how to write secure and efficient smart contracts.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        tags: ['solidity', 'ethereum', 'smart-contracts', 'blockchain'],
        categoryId: getCategory('blockchain'),
        isPublished: true,
        publishedAt: new Date(),
        readTimeMinutes: 13,
        viewsCount: 234,
      },
    ];

    await articleRepository.save(articles);
    this.logger.log('Articles seeded successfully');
  }
}
