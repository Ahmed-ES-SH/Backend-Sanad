import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Service } from '../services/schema/service.schema';
import { Category } from '../categories/schema/category.schema';

@Injectable()
export class ServiceSeeder {
  private readonly logger = new Logger(ServiceSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const serviceRepository = this.dataSource.getRepository(Service);
    const categoryRepository = this.dataSource.getRepository(Category);

    const existingServices = await serviceRepository.count();
    if (existingServices > 0) {
      this.logger.log('Services already seeded, skipping...');
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

    const services: Partial<Service>[] = [
      {
        title: 'Web Development',
        slug: 'web-development',
        shortDescription:
          'Custom web applications built with modern technologies.',
        longDescription:
          'I build high-performance, scalable web applications using the latest technologies. From simple landing pages to complex enterprise solutions, I deliver custom web apps that meet your specific needs.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/code.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        categoryId: getCategory('web-development'),
        isPublished: true,
        order: 1,
        basePrice: 1500,
      },
      {
        title: 'Mobile App Development',
        slug: 'mobile-app-development',
        shortDescription:
          'Cross-platform mobile applications for iOS and Android.',
        longDescription:
          'Create powerful mobile experiences with my cross-platform development services. I build native-quality mobile apps using React Native and Flutter that work seamlessly on both iOS and Android platforms.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/smartphone.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        categoryId: getCategory('mobile-development'),
        isPublished: true,
        order: 2,
        basePrice: 2000,
      },
      {
        title: 'UI/UX Design',
        slug: 'ui-ux-design',
        shortDescription:
          'User-centered design that creates memorable experiences.',
        longDescription:
          'Transform your ideas into beautiful, intuitive interfaces. I provide comprehensive UI/UX design services including user research, wireframing, prototyping, and high-fidelity design for web and mobile applications.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/pen-tool.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        categoryId: getCategory('ui-ux-design'),
        isPublished: true,
        order: 3,
        basePrice: 1200,
      },
      {
        title: 'API Development',
        slug: 'api-development',
        shortDescription: 'Robust and scalable RESTful and GraphQL APIs.',
        longDescription:
          'Build the backbone of your application with professionally designed APIs. I develop secure, well-documented RESTful APIs and GraphQL endpoints that power your web and mobile applications.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/server.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        categoryId: getCategory('api-development'),
        isPublished: true,
        order: 4,
        basePrice: 800,
      },
      {
        title: 'DevOps & Cloud',
        slug: 'devops-cloud',
        shortDescription: 'Cloud infrastructure and CI/CD pipeline setup.',
        longDescription:
          'Deploy your applications with confidence. I provide DevOps services including cloud infrastructure setup (AWS, GCP, Azure), CI/CD pipeline configuration, containerization with Docker, and Kubernetes orchestration.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/cloud.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        categoryId: getCategory('devops'),
        isPublished: true,
        order: 5,
        basePrice: 1000,
      },
      {
        title: 'Technical Consulting',
        slug: 'technical-consulting',
        shortDescription:
          'Expert advice on technology decisions and architecture.',
        longDescription:
          'Navigate your technology challenges with expert guidance. I offer technical consulting services including architecture reviews, technology stack selection, code audits, and team mentoring.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/lightbulb.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
        categoryId: getCategory('career-development'),
        isPublished: true,
        order: 6,
        basePrice: 150,
      },
      {
        title: 'Security Auditing',
        slug: 'security-auditing',
        shortDescription:
          'Comprehensive security audits and penetration testing.',
        longDescription:
          'Protect your applications from vulnerabilities with thorough security assessments. I perform penetration testing, code reviews, and provide detailed remediation reports.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/shield.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        categoryId: getCategory('cybersecurity'),
        isPublished: true,
        order: 7,
        basePrice: 2500,
      },
      {
        title: 'Blockchain Development',
        slug: 'blockchain-development',
        shortDescription:
          'Smart contracts and decentralized application development.',
        longDescription:
          'Enter the world of Web3 with professional blockchain development services. I build smart contracts, DApps, and DeFi protocols on Ethereum and other blockchain platforms.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/link.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        categoryId: getCategory('blockchain'),
        isPublished: true,
        order: 8,
        basePrice: 3000,
      },
      {
        title: 'Game Development',
        slug: 'game-development',
        shortDescription: 'Engaging games built with Unity and Unreal Engine.',
        longDescription:
          'Bring your game ideas to life with professional game development services. From concept to launch, I handle game design, programming, art integration, and publishing.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/gamepad-2.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        categoryId: getCategory('game-development'),
        isPublished: true,
        order: 9,
        basePrice: 5000,
      },
      {
        title: 'IoT Solutions',
        slug: 'iot-solutions',
        shortDescription: 'Connected device solutions and embedded systems.',
        longDescription:
          'Build smart connected products with my IoT development services. I design and implement end-to-end IoT solutions from sensor integration to cloud dashboards.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/cpu.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1553406830-ef2513052d77?w=800',
        categoryId: getCategory('iot'),
        isPublished: true,
        order: 10,
        basePrice: 1800,
      },
      {
        title: 'Cloud Migration',
        slug: 'cloud-migration',
        shortDescription: 'Seamless migration of applications to the cloud.',
        longDescription:
          'Move your applications to the cloud with zero downtime. I plan and execute cloud migrations including infrastructure setup, data migration, and performance optimization.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/cloud-upload.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        categoryId: getCategory('cloud-computing'),
        isPublished: true,
        order: 11,
        basePrice: 2200,
      },
      {
        title: 'E-Commerce Solutions',
        slug: 'e-commerce-solutions',
        shortDescription: 'Complete online store development and optimization.',
        longDescription:
          'Launch and grow your online business with custom e-commerce solutions. I build stores with payment integration, inventory management, and conversion optimization.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/shopping-cart.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        categoryId: getCategory('e-commerce'),
        isPublished: true,
        order: 12,
        basePrice: 1500,
      },
      {
        title: 'CMS Development',
        slug: 'cms-development',
        shortDescription: 'Custom content management systems and integrations.',
        longDescription:
          'Manage your content efficiently with custom CMS solutions. I build headless CMS platforms, integrate with existing systems, and create custom content workflows.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/file-text.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        categoryId: getCategory('cms'),
        isPublished: true,
        order: 13,
        basePrice: 900,
      },
      {
        title: 'Quality Assurance',
        slug: 'quality-assurance',
        shortDescription:
          'Comprehensive testing and quality assurance services.',
        longDescription:
          'Ensure your software works flawlessly with thorough testing services. I provide automated testing, manual testing, performance testing, and quality audits.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/check-circle.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        categoryId: getCategory('testing-qa'),
        isPublished: true,
        order: 14,
        basePrice: 600,
      },
      {
        title: 'Performance Optimization',
        slug: 'performance-optimization',
        shortDescription:
          'Speed up your applications and improve user experience.',
        longDescription:
          'Transform slow applications into blazing-fast experiences. I analyze bottlenecks, optimize database queries, implement caching strategies, and improve overall performance.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/zap.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        categoryId: getCategory('performance'),
        isPublished: true,
        order: 15,
        basePrice: 850,
      },
      {
        title: 'Accessibility Consulting',
        slug: 'accessibility-consulting',
        shortDescription: 'Make your products accessible to all users.',
        longDescription:
          'Ensure your digital products are accessible to everyone. I provide accessibility audits, WCAG compliance testing, and remediation services.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/eye.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
        categoryId: getCategory('accessibility'),
        isPublished: true,
        order: 16,
        basePrice: 400,
      },
      {
        title: 'SEO Optimization',
        slug: 'seo-optimization',
        shortDescription:
          'Improve your search engine rankings and organic traffic.',
        longDescription:
          'Boost your visibility in search engines with proven SEO strategies. I provide technical SEO audits, content optimization, and ongoing SEO management.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/search.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1572177215150-f99da4470e63?w=800',
        categoryId: getCategory('seo'),
        isPublished: true,
        order: 17,
        basePrice: 500,
      },
      {
        title: 'Microservices Architecture',
        slug: 'microservices-architecture',
        shortDescription: 'Design and implement microservice-based systems.',
        longDescription:
          'Scale your applications with microservice architecture. I design, implement, and migrate monolithic applications to microservice-based architectures.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/layers.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        categoryId: getCategory('microservices'),
        isPublished: true,
        order: 18,
        basePrice: 2500,
      },
      {
        title: 'Serverless Development',
        slug: 'serverless-development',
        shortDescription: 'Build and deploy serverless applications at scale.',
        longDescription:
          'Leverage serverless computing for cost-effective, auto-scaling applications. I build serverless APIs, event-driven architectures, and data processing pipelines.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/function.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        categoryId: getCategory('serverless'),
        isPublished: true,
        order: 19,
        basePrice: 1200,
      },
      {
        title: 'PWA Development',
        slug: 'pwa-development',
        shortDescription: 'Progressive web apps with native-like experiences.',
        longDescription:
          'Build progressive web apps that deliver native app experiences on the web. Features include offline support, push notifications, and installability.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/wifi.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        categoryId: getCategory('progressive-web-apps'),
        isPublished: true,
        order: 20,
        basePrice: 1100,
      },
      {
        title: 'AR/VR Development',
        slug: 'ar-vr-development',
        shortDescription:
          'Immersive augmented and virtual reality experiences.',
        longDescription:
          'Create immersive AR and VR experiences for web and mobile. I build interactive 3D applications, product visualizations, and training simulations.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/glasses.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
        categoryId: getCategory('ar-vr'),
        isPublished: true,
        order: 21,
        basePrice: 3500,
      },
      {
        title: 'Machine Learning Solutions',
        slug: 'machine-learning-solutions',
        shortDescription: 'Custom ML models and AI integration services.',
        longDescription:
          'Harness the power of machine learning for your business. I develop custom ML models, integrate AI APIs, and build intelligent automation solutions.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/brain.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        categoryId: getCategory('machine-learning'),
        isPublished: true,
        order: 22,
        basePrice: 4000,
      },
      {
        title: 'NLP Services',
        slug: 'nlp-services',
        shortDescription: 'Natural language processing and text analysis.',
        longDescription:
          'Extract insights from text data with NLP services. I build chatbots, sentiment analysis systems, text classifiers, and language translation solutions.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/message-square.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        categoryId: getCategory('nlp'),
        isPublished: true,
        order: 23,
        basePrice: 3000,
      },
      {
        title: 'Computer Vision',
        slug: 'computer-vision',
        shortDescription: 'Image recognition and video analysis solutions.',
        longDescription:
          'Enable your applications to see and understand visual data. I build image classification, object detection, and video analysis systems.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/camera.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
        categoryId: getCategory('computer-vision'),
        isPublished: true,
        order: 24,
        basePrice: 3500,
      },
      {
        title: 'Database Design & Optimization',
        slug: 'database-design-optimization',
        shortDescription:
          'Efficient database architecture and query optimization.',
        longDescription:
          'Design databases that scale with your business. I provide database architecture, query optimization, indexing strategies, and migration services.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/database.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
        categoryId: getCategory('database-design'),
        isPublished: true,
        order: 25,
        basePrice: 950,
      },
      {
        title: 'Frontend Development',
        slug: 'frontend-development',
        shortDescription: 'Modern, responsive frontend applications.',
        longDescription:
          'Create stunning user interfaces with modern frontend frameworks. I specialize in React, Vue, and Angular with a focus on performance and accessibility.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/layout.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        categoryId: getCategory('frontend-frameworks'),
        isPublished: true,
        order: 26,
        basePrice: 1200,
      },
      {
        title: 'Backend Development',
        slug: 'backend-development',
        shortDescription: 'Scalable server-side applications and APIs.',
        longDescription:
          'Build robust backend systems that power your applications. I develop with NestJS, Express, Django, and other frameworks with a focus on security and performance.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/terminal.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        categoryId: getCategory('backend-frameworks'),
        isPublished: true,
        order: 27,
        basePrice: 1400,
      },
      {
        title: 'System Design Consulting',
        slug: 'system-design-consulting',
        shortDescription: 'Architect scalable and resilient systems.',
        longDescription:
          'Design systems that handle millions of users. I provide system design consulting including architecture patterns, scalability planning, and technology selection.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/network.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        categoryId: getCategory('system-design'),
        isPublished: true,
        order: 28,
        basePrice: 2000,
      },
      {
        title: 'Open Source Consulting',
        slug: 'open-source-consulting',
        shortDescription: 'Open source strategy and contribution guidance.',
        longDescription:
          'Navigate the open source ecosystem effectively. I help organizations develop open source strategies, manage communities, and build sustainable open source projects.',
        iconUrl: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/github.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        categoryId: getCategory('open-source'),
        isPublished: true,
        order: 29,
        basePrice: 300,
      },
      {
        title: 'Freelance Coaching',
        slug: 'freelance-coaching',
        shortDescription: 'Mentoring for aspiring freelance developers.',
        longDescription:
          'Start and grow your freelance career with expert guidance. I provide coaching on finding clients, pricing, project management, and building a sustainable freelance business.',
        iconUrl:
          'https://cdn.jsdelivr.net/npm/lucide@0.263.1/icons/briefcase.svg',
        coverImageUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        categoryId: getCategory('freelancing'),
        isPublished: true,
        order: 30,
        basePrice: 100,
      },
    ];

    await serviceRepository.save(services);
    this.logger.log('Services seeded successfully');
  }
}
