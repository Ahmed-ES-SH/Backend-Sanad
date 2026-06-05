import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Project } from '../portfolio/schema/project.schema';
import { Category } from '../categories/schema/category.schema';

@Injectable()
export class ProjectSeeder {
  private readonly logger = new Logger(ProjectSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const projectRepository = this.dataSource.getRepository(Project);
    const categoryRepository = this.dataSource.getRepository(Category);

    const existingProjects = await projectRepository.count();
    if (existingProjects > 0) {
      this.logger.log('Projects already seeded, skipping...');
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

    const projects: Partial<Project>[] = [
      {
        title: 'E-Commerce Platform',
        slug: 'ecommerce-platform',
        shortDescription:
          'A full-featured e-commerce platform with payment integration.',
        longDescription:
          'A comprehensive e-commerce solution built with modern technologies. Features include user authentication, product management, shopping cart, order processing, and secure payment integration via Stripe.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        images: [
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
        ],
        techStack: ['NestJS', 'PostgreSQL', 'React', 'Stripe', 'Docker'],
        categoryId: getCategory('e-commerce'),
        liveUrl: 'https://example-ecommerce.com',
        repoUrl: 'https://github.com/example/ecommerce',
        isPublished: true,
        isFeatured: true,
        order: 1,
      },
      {
        title: 'Task Management App',
        slug: 'task-management-app',
        shortDescription:
          'Collaborative task management application with real-time updates.',
        longDescription:
          'A modern task management application enabling teams to collaborate effectively. Features drag-and-drop boards, real-time notifications, file attachments, and team workspaces.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        images: [
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        ],
        techStack: ['Vue.js', 'Node.js', 'Socket.io', 'MongoDB', 'Redis'],
        categoryId: getCategory('web-development'),
        liveUrl: 'https://taskapp.example.com',
        repoUrl: 'https://github.com/example/taskapp',
        isPublished: true,
        isFeatured: true,
        order: 2,
      },
      {
        title: 'Fitness Tracker Mobile App',
        slug: 'fitness-tracker-mobile-app',
        shortDescription:
          'Cross-platform mobile app for tracking fitness activities.',
        longDescription:
          'A fitness tracking application that helps users monitor their workouts, set goals, and track progress. Supports GPS tracking for running and cycling, workout history, and health integrations.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        ],
        techStack: ['React Native', 'Firebase', 'Google Maps API', 'Redux'],
        categoryId: getCategory('mobile-development'),
        liveUrl: 'https://apps.apple.com/fitness-tracker',
        repoUrl: 'https://github.com/example/fitness-tracker',
        isPublished: true,
        isFeatured: false,
        order: 3,
      },
      {
        title: 'Portfolio Design System',
        slug: 'portfolio-design-system',
        shortDescription:
          'A comprehensive design system for creative portfolios.',
        longDescription:
          'A production-ready design system including UI components, color tokens, typography scales, and accessibility guidelines. Perfect for building creative agency portfolios.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        images: [
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        ],
        techStack: ['Storybook', 'Figma', 'TypeScript', 'CSS-in-JS'],
        categoryId: getCategory('ui-ux-design'),
        liveUrl: 'https://design-system.example.com',
        repoUrl: 'https://github.com/example/design-system',
        isPublished: true,
        isFeatured: true,
        order: 4,
      },
      {
        title: 'CI/CD Pipeline Automation',
        slug: 'cicd-pipeline-automation',
        shortDescription:
          'Automated deployment pipelines for microservices architecture.',
        longDescription:
          'A complete CI/CD solution for deploying microservices to Kubernetes. Includes automated testing, staging environments, blue-green deployments, and monitoring integration.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800',
        images: [
          'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800',
        ],
        techStack: [
          'GitHub Actions',
          'Kubernetes',
          'Helm',
          'Terraform',
          'Prometheus',
        ],
        categoryId: getCategory('devops'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/cicd-pipeline',
        isPublished: true,
        isFeatured: false,
        order: 5,
      },
      {
        title: 'Sentiment Analysis Dashboard',
        slug: 'sentiment-analysis-dashboard',
        shortDescription:
          'Real-time social media sentiment analysis and visualization.',
        longDescription:
          'A data visualization dashboard that analyzes social media posts for sentiment. Uses NLP models to classify positive, negative, and neutral opinions with trend analysis.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1551288049-bebda4e02f71?w=800',
        images: [
          'https://images.unsplash.com/photo-1551288049-bebda4e02f71?w=800',
        ],
        techStack: ['Python', 'TensorFlow', 'Django', 'D3.js', 'PostgreSQL'],
        categoryId: getCategory('data-science'),
        liveUrl: 'https://sentiment.example.com',
        repoUrl: 'https://github.com/example/sentiment-analysis',
        isPublished: true,
        isFeatured: true,
        order: 6,
      },
      {
        title: 'Penetration Testing Toolkit',
        slug: 'penetration-testing-toolkit',
        shortDescription:
          'Automated security scanning and vulnerability assessment tool.',
        longDescription:
          'A comprehensive security toolkit that automates common penetration testing tasks including port scanning, vulnerability detection, and report generation.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        images: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        ],
        techStack: ['Python', 'Nmap', 'Metasploit', 'Docker', 'React'],
        categoryId: getCategory('cybersecurity'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/pentest-toolkit',
        isPublished: true,
        isFeatured: false,
        order: 7,
      },
      {
        title: 'Decentralized Exchange (DEX)',
        slug: 'decentralized-exchange-dex',
        shortDescription:
          'A decentralized cryptocurrency exchange built on Ethereum.',
        longDescription:
          'A fully decentralized exchange allowing users to trade ERC-20 tokens without intermediaries. Features liquidity pools, automated market making, and yield farming.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        images: [
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        ],
        techStack: ['Solidity', 'React', 'Web3.js', 'Ethers.js', 'Hardhat'],
        categoryId: getCategory('blockchain'),
        liveUrl: 'https://dex.example.com',
        repoUrl: 'https://github.com/example/dex',
        isPublished: true,
        isFeatured: true,
        order: 8,
      },
      {
        title: '2D Platformer Game',
        slug: '2d-platformer-game',
        shortDescription: 'A retro-style 2D platformer game built with Unity.',
        longDescription:
          'A classic 2D platformer with pixel art graphics, multiple levels, power-ups, and a boss fight system. Built with Unity and C#.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        images: [
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        ],
        techStack: ['Unity', 'C#', 'Aseprite', 'FMOD'],
        categoryId: getCategory('game-development'),
        liveUrl: 'https://store.steampowered.com/platformer',
        repoUrl: null,
        isPublished: true,
        isFeatured: false,
        order: 9,
      },
      {
        title: 'Smart Home IoT Dashboard',
        slug: 'smart-home-iot-dashboard',
        shortDescription:
          'Centralized dashboard for managing IoT devices at home.',
        longDescription:
          'A smart home management dashboard that connects to various IoT devices including lights, thermostats, cameras, and sensors. Features real-time monitoring and automation rules.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1553406830-ef2513052d77?w=800',
        images: [
          'https://images.unsplash.com/photo-1553406830-ef2513052d77?w=800',
        ],
        techStack: ['Raspberry Pi', 'Node.js', 'MQTT', 'React', 'InfluxDB'],
        categoryId: getCategory('iot'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/smart-home',
        isPublished: true,
        isFeatured: true,
        order: 10,
      },
      {
        title: 'Serverless Image Processing Pipeline',
        slug: 'serverless-image-processing-pipeline',
        shortDescription: 'Automated image processing using AWS Lambda and S3.',
        longDescription:
          'A serverless pipeline that automatically resizes, optimizes, and converts images uploaded to S3. Uses Lambda functions triggered by S3 events.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        images: [
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        ],
        techStack: ['AWS Lambda', 'S3', 'Sharp', 'CloudFormation', 'Node.js'],
        categoryId: getCategory('serverless'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/image-pipeline',
        isPublished: true,
        isFeatured: false,
        order: 11,
      },
      {
        title: 'GraphQL API Gateway',
        slug: 'graphql-api-gateway',
        shortDescription: 'Unified GraphQL gateway for multiple microservices.',
        longDescription:
          'An API gateway that aggregates multiple microservice APIs into a single GraphQL endpoint. Features schema stitching, caching, and rate limiting.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        images: [
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        ],
        techStack: [
          'Apollo Federation',
          'Node.js',
          'Redis',
          'Docker',
          'Kubernetes',
        ],
        categoryId: getCategory('api-development'),
        liveUrl: 'https://graphql-gateway.example.com',
        repoUrl: 'https://github.com/example/graphql-gateway',
        isPublished: true,
        isFeatured: true,
        order: 12,
      },
      {
        title: 'Online Marketplace',
        slug: 'online-marketplace',
        shortDescription: 'Multi-vendor marketplace with escrow payments.',
        longDescription:
          'A platform where multiple vendors can sell products. Features include vendor dashboards, product reviews, escrow payment system, and dispute resolution.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        images: [
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        ],
        techStack: ['Next.js', 'NestJS', 'PostgreSQL', 'Stripe Connect', 'AWS'],
        categoryId: getCategory('e-commerce'),
        liveUrl: 'https://marketplace.example.com',
        repoUrl: 'https://github.com/example/marketplace',
        isPublished: true,
        isFeatured: false,
        order: 13,
      },
      {
        title: 'Content Management Platform',
        slug: 'content-management-platform',
        shortDescription: 'Headless CMS with visual page builder.',
        longDescription:
          'A modern headless CMS with a drag-and-drop page builder, role-based access control, content versioning, and multi-language support.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        images: [
          'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        ],
        techStack: ['React', 'Node.js', 'MongoDB', 'GraphQL', 'AWS S3'],
        categoryId: getCategory('cms'),
        liveUrl: 'https://cms.example.com',
        repoUrl: 'https://github.com/example/cms-platform',
        isPublished: true,
        isFeatured: true,
        order: 14,
      },
      {
        title: 'Automated Testing Framework',
        slug: 'automated-testing-framework',
        shortDescription:
          'End-to-end testing framework with visual regression.',
        longDescription:
          'A comprehensive testing framework that combines E2E testing, visual regression testing, and performance testing in a unified dashboard.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        images: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        ],
        techStack: [
          'Playwright',
          'Jest',
          'Percy',
          'GitHub Actions',
          'TypeScript',
        ],
        categoryId: getCategory('testing-qa'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/testing-framework',
        isPublished: true,
        isFeatured: false,
        order: 15,
      },
      {
        title: 'Real-Time Analytics Dashboard',
        slug: 'real-time-analytics-dashboard',
        shortDescription: 'Real-time web analytics with live visitor tracking.',
        longDescription:
          'A privacy-focused analytics dashboard that tracks page views, visitor locations, device types, and user journeys in real-time.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        images: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        ],
        techStack: ['Vue.js', 'Go', 'ClickHouse', 'WebSocket', 'Redis'],
        categoryId: getCategory('performance'),
        liveUrl: 'https://analytics.example.com',
        repoUrl: 'https://github.com/example/analytics',
        isPublished: true,
        isFeatured: true,
        order: 16,
      },
      {
        title: 'Accessible Component Library',
        slug: 'accessible-component-library',
        shortDescription: 'WCAG 2.1 AA compliant UI component library.',
        longDescription:
          'A comprehensive UI component library built with accessibility as a first-class concern. Every component meets WCAG 2.1 AA standards.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        images: [
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        ],
        techStack: [
          'React',
          'Storybook',
          'axe-core',
          'TypeScript',
          'CSS Modules',
        ],
        categoryId: getCategory('accessibility'),
        liveUrl: 'https://components.example.com',
        repoUrl: 'https://github.com/example/a11y-components',
        isPublished: true,
        isFeatured: false,
        order: 17,
      },
      {
        title: 'SEO Audit Tool',
        slug: 'seo-audit-tool',
        shortDescription: 'Automated SEO auditing and recommendation engine.',
        longDescription:
          'A tool that crawls websites and generates comprehensive SEO audit reports including meta tags analysis, performance scores, and actionable recommendations.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1572177215150-f99da4470e63?w=800',
        images: [
          'https://images.unsplash.com/photo-1572177215150-f99da4470e63?w=800',
        ],
        techStack: [
          'Node.js',
          'Puppeteer',
          'Lighthouse',
          'React',
          'PostgreSQL',
        ],
        categoryId: getCategory('seo'),
        liveUrl: 'https://seo-audit.example.com',
        repoUrl: 'https://github.com/example/seo-audit',
        isPublished: true,
        isFeatured: true,
        order: 18,
      },
      {
        title: 'Event-Driven Microservices',
        slug: 'event-driven-microservices',
        shortDescription: 'Event-sourced microservices with CQRS pattern.',
        longDescription:
          'A reference implementation of event-driven microservices using CQRS and Event Sourcing patterns. Features multiple bounded contexts with Kafka event streaming.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        images: [
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        ],
        techStack: ['NestJS', 'Kafka', 'PostgreSQL', 'Docker', 'Kubernetes'],
        categoryId: getCategory('microservices'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/event-driven-ms',
        isPublished: true,
        isFeatured: true,
        order: 19,
      },
      {
        title: 'PWA Weather App',
        slug: 'pwa-weather-app',
        shortDescription:
          'Offline-first progressive web app for weather forecasts.',
        longDescription:
          'A beautiful weather PWA that works offline with cached data. Features location-based forecasts, severe weather alerts, and weather maps.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        images: [
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        ],
        techStack: ['React', 'Workbox', 'OpenWeather API', 'IndexedDB', 'Vite'],
        categoryId: getCategory('progressive-web-apps'),
        liveUrl: 'https://weather-pwa.example.com',
        repoUrl: 'https://github.com/example/weather-pwa',
        isPublished: true,
        isFeatured: false,
        order: 20,
      },
      {
        title: 'AR Furniture Placement App',
        slug: 'ar-furniture-placement-app',
        shortDescription:
          'Web-based AR app for visualizing furniture in your space.',
        longDescription:
          'An augmented reality application that lets users place 3D furniture models in their real environment using their phone camera and WebXR.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
        images: [
          'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
        ],
        techStack: ['Three.js', 'WebXR', 'React', 'GLTF', 'Blender'],
        categoryId: getCategory('ar-vr'),
        liveUrl: 'https://ar-furniture.example.com',
        repoUrl: 'https://github.com/example/ar-furniture',
        isPublished: true,
        isFeatured: true,
        order: 21,
      },
      {
        title: 'ML Model Serving Platform',
        slug: 'ml-model-serving-platform',
        shortDescription:
          'Platform for deploying and serving ML models at scale.',
        longDescription:
          'A platform that makes it easy to deploy machine learning models as REST APIs. Supports model versioning, A/B testing, and automatic scaling.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        images: [
          'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        ],
        techStack: ['Python', 'FastAPI', 'TensorFlow', 'Docker', 'Kubernetes'],
        categoryId: getCategory('machine-learning'),
        liveUrl: 'https://ml-serving.example.com',
        repoUrl: 'https://github.com/example/ml-serving',
        isPublished: true,
        isFeatured: false,
        order: 22,
      },
      {
        title: 'Chatbot with NLP',
        slug: 'chatbot-with-nlp',
        shortDescription:
          'Intelligent chatbot powered by natural language processing.',
        longDescription:
          'A conversational AI chatbot that understands user intent, maintains context, and provides helpful responses. Integrates with multiple messaging platforms.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        images: [
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        ],
        techStack: ['Python', 'spaCy', 'FastAPI', 'React', 'WebSocket'],
        categoryId: getCategory('nlp'),
        liveUrl: 'https://chatbot.example.com',
        repoUrl: 'https://github.com/example/nlp-chatbot',
        isPublished: true,
        isFeatured: true,
        order: 23,
      },
      {
        title: 'Image Classification Service',
        slug: 'image-classification-service',
        shortDescription:
          'Deep learning image classification API with 99% accuracy.',
        longDescription:
          'A production-ready image classification service using pre-trained deep learning models. Supports batch processing and custom model training.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
        images: [
          'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
        ],
        techStack: ['Python', 'PyTorch', 'FastAPI', 'Redis', 'Docker'],
        categoryId: getCategory('computer-vision'),
        liveUrl: 'https://image-classify.example.com',
        repoUrl: 'https://github.com/example/image-classify',
        isPublished: true,
        isFeatured: false,
        order: 24,
      },
      {
        title: 'Database Migration Tool',
        slug: 'database-migration-tool',
        shortDescription: 'Zero-downtime database migration framework.',
        longDescription:
          'A migration tool that enables zero-downtime schema changes for large databases. Features expand-contract pattern, rollback support, and progress monitoring.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
        images: [
          'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
        ],
        techStack: ['Go', 'PostgreSQL', 'Redis', 'Docker', 'Terraform'],
        categoryId: getCategory('database-design'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/db-migration',
        isPublished: true,
        isFeatured: true,
        order: 25,
      },
      {
        title: 'Angular Enterprise Dashboard',
        slug: 'angular-enterprise-dashboard',
        shortDescription: 'Enterprise-grade dashboard built with Angular.',
        longDescription:
          'A comprehensive enterprise dashboard with role-based access, data visualization, real-time notifications, and report generation.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        images: [
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        ],
        techStack: [
          'Angular',
          'NgRx',
          'D3.js',
          'TypeScript',
          'Material Design',
        ],
        categoryId: getCategory('frontend-frameworks'),
        liveUrl: 'https://dashboard.example.com',
        repoUrl: 'https://github.com/example/angular-dashboard',
        isPublished: true,
        isFeatured: false,
        order: 26,
      },
      {
        title: 'Django REST API Platform',
        slug: 'django-rest-api-platform',
        shortDescription: 'Production-ready REST API built with Django.',
        longDescription:
          'A scalable REST API platform with authentication, rate limiting, pagination, filtering, and comprehensive API documentation using OpenAPI/Swagger.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        images: [
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        ],
        techStack: [
          'Django',
          'Django REST Framework',
          'PostgreSQL',
          'Redis',
          'Docker',
        ],
        categoryId: getCategory('backend-frameworks'),
        liveUrl: 'https://api-platform.example.com',
        repoUrl: 'https://github.com/example/django-api',
        isPublished: true,
        isFeatured: true,
        order: 27,
      },
      {
        title: 'Distributed Cache System',
        slug: 'distributed-cache-system',
        shortDescription: 'High-performance distributed caching system.',
        longDescription:
          'A custom distributed cache system with consistent hashing, replication, and automatic failover. Benchmarked against Redis for comparison.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        images: [
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        ],
        techStack: ['Rust', 'Tokio', 'gRPC', 'Docker', 'Prometheus'],
        categoryId: getCategory('system-design'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/distributed-cache',
        isPublished: true,
        isFeatured: false,
        order: 28,
      },
      {
        title: 'Open Source CLI Toolkit',
        slug: 'open-source-cli-toolkit',
        shortDescription:
          'Developer productivity CLI toolkit with 50+ commands.',
        longDescription:
          'An open-source CLI toolkit that provides 50+ productivity commands for developers including project scaffolding, code generation, and git utilities.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        images: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        ],
        techStack: ['Rust', 'Clap', 'GitHub Actions', 'Crates.io'],
        categoryId: getCategory('open-source'),
        liveUrl: null,
        repoUrl: 'https://github.com/example/cli-toolkit',
        isPublished: true,
        isFeatured: true,
        order: 29,
      },
      {
        title: 'Freelancer Portfolio Platform',
        slug: 'freelancer-portfolio-platform',
        shortDescription: 'Platform for freelancers to showcase their work.',
        longDescription:
          'A portfolio platform designed for freelancers. Features customizable themes, project showcases, client testimonials, and availability calendar.',
        coverImageUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        images: [
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        ],
        techStack: [
          'Next.js',
          'Tailwind CSS',
          'PostgreSQL',
          'Stripe',
          'Vercel',
        ],
        categoryId: getCategory('freelancing'),
        liveUrl: 'https://portfolio-platform.example.com',
        repoUrl: 'https://github.com/example/portfolio-platform',
        isPublished: true,
        isFeatured: false,
        order: 30,
      },
    ];

    await projectRepository.save(projects);
    this.logger.log('Projects seeded successfully');
  }
}
