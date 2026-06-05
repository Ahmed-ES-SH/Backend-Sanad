import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContactMessage } from '../contact/schema/contact-message.schema';

@Injectable()
export class ContactMessageSeeder {
  private readonly logger = new Logger(ContactMessageSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const contactRepository = this.dataSource.getRepository(ContactMessage);

    const existingMessages = await contactRepository.count();
    if (existingMessages > 0) {
      this.logger.log('Contact messages already seeded, skipping...');
      return;
    }

    const messages: Partial<ContactMessage>[] = [
      {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Project Inquiry',
        message:
          'Hi, I am interested in hiring you for a web development project. Could you please provide more information about your services and pricing?',
        isRead: false,
        ipAddress: '192.168.1.100',
      },
      {
        fullName: 'Sarah Smith',
        email: 'sarah.smith@techcorp.com',
        subject: 'Collaboration Proposal',
        message:
          'We are looking for a development partner for our upcoming startup project. Would you be interested in discussing a potential collaboration?',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '10.0.0.50',
      },
      {
        fullName: 'Mike Johnson',
        email: 'mike.j@email.com',
        subject: 'Bug Report',
        message:
          'I found a bug on your contact form. When I try to submit a message, I get an error. Can you help me resolve this issue?',
        isRead: false,
        ipAddress: '172.16.0.25',
      },
      {
        fullName: 'Emily Davis',
        email: 'emily.davis@designstudio.io',
        subject: 'Design Services Question',
        message:
          'Hello! I love your portfolio design. Do you offer custom design services for clients? If so, I would love to discuss a project with you.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '192.168.2.75',
      },
      {
        fullName: 'Alex Thompson',
        email: 'alex.t@freelance.net',
        subject: 'Technical Consultation',
        message:
          'I need advice on architecting a scalable microservices application. Are you available for a paid technical consultation session?',
        isRead: false,
        ipAddress: '10.10.10.10',
      },
      {
        fullName: 'Lisa Anderson',
        email: 'lisa.a@startup.co',
        subject: 'Mobile App Development',
        message:
          'Our startup needs a cross-platform mobile app for both iOS and Android. We have the designs ready and need an experienced developer. Can we schedule a call?',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '203.0.113.42',
      },
      {
        fullName: 'Robert Chen',
        email: 'robert.chen@enterprise.com',
        subject: 'Enterprise Solution Inquiry',
        message:
          'We are a large enterprise looking for a complete digital transformation. We need someone who can lead the technical team and architect the solution.',
        isRead: false,
        ipAddress: '198.51.100.17',
      },
      {
        fullName: 'Maria Garcia',
        email: 'maria.g@agency.com',
        subject: 'Agency Partnership',
        message:
          'I run a digital agency and we are looking for a reliable backend developer to partner with on client projects. Are you open to white-label work?',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '192.0.2.88',
      },
      {
        fullName: 'David Wilson',
        email: 'david.w@ecommerce.shop',
        subject: 'E-Commerce Platform Redesign',
        message:
          'We need to redesign our e-commerce platform to improve conversion rates. Looking for someone with experience in Shopify and custom integrations.',
        isRead: false,
        ipAddress: '198.51.100.200',
      },
      {
        fullName: 'Jennifer Lee',
        email: 'jennifer.lee@healthtech.io',
        subject: 'Healthcare App Development',
        message:
          'We are building a healthcare application that needs to be HIPAA compliant. Do you have experience with healthcare regulations and secure data handling?',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '203.0.113.15',
      },
      {
        fullName: 'James Brown',
        email: 'james.b@fintech.com',
        subject: 'Payment Integration Help',
        message:
          'We are having issues with our Stripe integration. Payments are being processed but webhooks are not firing correctly. Need urgent assistance.',
        isRead: false,
        ipAddress: '192.168.5.33',
      },
      {
        fullName: 'Anna White',
        email: 'anna.w@edtech.org',
        subject: 'Learning Platform Development',
        message:
          'We want to build an online learning platform with video courses, quizzes, and progress tracking. Can you provide a quote and timeline?',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '10.0.1.100',
      },
      {
        fullName: 'Thomas Martin',
        email: 'thomas.m@realestate.com',
        subject: 'Real Estate Website',
        message:
          'Looking for a developer to build a real estate listing website with map integration, property search, and agent profiles. Budget is flexible.',
        isRead: false,
        ipAddress: '172.16.5.50',
      },
      {
        fullName: 'Sophie Taylor',
        email: 'sophie.t@restaurant.com',
        subject: 'Restaurant Ordering System',
        message:
          'We need an online ordering system for our restaurant chain. It should support multiple locations, menu management, and delivery tracking.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '192.168.10.200',
      },
      {
        fullName: 'William Harris',
        email: 'william.h@logistics.com',
        subject: 'Fleet Management System',
        message:
          'We need a fleet management system with GPS tracking, route optimization, and maintenance scheduling. This is a large-scale project.',
        isRead: false,
        ipAddress: '10.20.30.40',
      },
      {
        fullName: 'Olivia Clark',
        email: 'olivia.c@nonprofit.org',
        subject: 'Nonprofit Website Redesign',
        message:
          'Our nonprofit organization needs a website redesign to improve donations and volunteer signups. We have a limited budget but need professional results.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '198.51.100.75',
      },
      {
        fullName: 'Daniel Lewis',
        email: 'daniel.l@travel.com',
        subject: 'Travel Booking Platform',
        message:
          'We are building a travel booking platform that aggregates flights, hotels, and activities. Need someone experienced with API integrations.',
        isRead: false,
        ipAddress: '203.0.113.99',
      },
      {
        fullName: 'Emma Robinson',
        email: 'emma.r@fitness.com',
        subject: 'Fitness App Consultation',
        message:
          'I have an idea for a fitness app that connects personal trainers with clients. I need technical advice on the best approach and estimated costs.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '192.0.2.150',
      },
      {
        fullName: 'Christopher Hall',
        email: 'chris.h@music.com',
        subject: 'Music Streaming Service',
        message:
          'We are planning to launch a music streaming service for independent artists. Need help with audio streaming, DRM, and payment processing.',
        isRead: false,
        ipAddress: '172.16.20.30',
      },
      {
        fullName: 'Isabella Young',
        email: 'isabella.y@fashion.com',
        subject: 'Fashion E-Commerce',
        message:
          'Looking for a developer to build a luxury fashion e-commerce site with AR try-on features and personalized recommendations.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '10.0.5.75',
      },
      {
        fullName: 'Matthew King',
        email: 'matthew.k@security.com',
        subject: 'Security Audit Request',
        message:
          'We need a comprehensive security audit of our web application. It handles sensitive customer data and we want to ensure it is properly secured.',
        isRead: false,
        ipAddress: '198.51.100.120',
      },
      {
        fullName: 'Mia Wright',
        email: 'mia.w@social.com',
        subject: 'Social Media Platform',
        message:
          'We are building a niche social media platform for professionals in the creative industry. Need help with real-time features and content moderation.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '203.0.113.200',
      },
      {
        fullName: 'Andrew Scott',
        email: 'andrew.s@gaming.com',
        subject: 'Game Backend Development',
        message:
          'We are developing a multiplayer mobile game and need help with the backend infrastructure including matchmaking, leaderboards, and real-time communication.',
        isRead: false,
        ipAddress: '192.168.30.40',
      },
      {
        fullName: 'Charlotte Green',
        email: 'charlotte.g@ai.com',
        subject: 'AI Integration Services',
        message:
          'We want to integrate AI features into our existing SaaS product. Looking for someone with experience in machine learning APIs and natural language processing.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '10.10.20.30',
      },
      {
        fullName: 'Joshua Adams',
        email: 'joshua.a@blockchain.io',
        subject: 'Smart Contract Development',
        message:
          'We need a Solidity developer to write and audit smart contracts for our DeFi protocol. Security is our top priority.',
        isRead: false,
        ipAddress: '172.16.40.50',
      },
      {
        fullName: 'Amelia Baker',
        email: 'amelia.b@iot.com',
        subject: 'IoT Dashboard Development',
        message:
          'We have a network of IoT sensors and need a dashboard to visualize the data in real-time. The dashboard should support alerts and historical analysis.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '192.0.2.250',
      },
      {
        fullName: 'Ethan Nelson',
        email: 'ethan.n@cloud.com',
        subject: 'Cloud Infrastructure Setup',
        message:
          'We are migrating from on-premise servers to AWS. Need help with infrastructure design, migration strategy, and cost optimization.',
        isRead: false,
        ipAddress: '198.51.100.180',
      },
      {
        fullName: 'Harper Carter',
        email: 'harper.c@data.com',
        subject: 'Data Pipeline Development',
        message:
          'We need to build a data pipeline that processes millions of events per day. Looking for someone experienced with Kafka, Spark, and data warehousing.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '203.0.113.55',
      },
      {
        fullName: 'Alexander Mitchell',
        email: 'alex.m@startup.io',
        subject: 'MVP Development',
        message:
          'I have a startup idea and need to build an MVP quickly to test the market. Looking for a full-stack developer who can work fast without sacrificing quality.',
        isRead: false,
        ipAddress: '10.0.0.100',
      },
      {
        fullName: 'Evelyn Perez',
        email: 'evelyn.p@consulting.com',
        subject: 'Technical Documentation',
        message:
          'We need someone to create comprehensive technical documentation for our API. It should include OpenAPI specs, code examples, and interactive documentation.',
        isRead: true,
        repliedAt: new Date(),
        ipAddress: '192.168.50.60',
      },
    ];

    await contactRepository.save(messages);
    this.logger.log('Contact messages seeded successfully');
  }
}
