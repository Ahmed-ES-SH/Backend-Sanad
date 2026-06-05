# Sanad Backend

> Production-grade NestJS API for a comprehensive e-commerce & service management platform with real-time capabilities, payment processing, and admin dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-LTS-green?logo=node.js)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-UNLICENSED-gray)](#)

---

## 📋 Overview

Sanad Backend is a robust, scalable API that powers a full-featured platform combining:

- **E-commerce functionality** (product catalog, cart, orders)
- **Service management** (booking, ordering, portfolio)
- **Blog system** (content management)
- **Payment processing** (Stripe integration)
- **Real-time features** (WebSockets, live notifications)
- **Admin controls** (dashboard, user management)
- **Authentication & Authorization** (JWT + RBAC)

---

## 🏗️ Tech Stack

| Category              | Technology                         | Version |
| --------------------- | ---------------------------------- | ------- |
| **Framework**         | NestJS                             | 11.0.1  |
| **Language**          | TypeScript                         | 5.7.3   |
| **Database**          | PostgreSQL                         | Latest  |
| **ORM**               | TypeORM                            | 0.3.28  |
| **Authentication**    | JWT + Passport                     | 11.0.x  |
| **Payment Gateway**   | Stripe                             | 17.7.0  |
| **Real-time**         | Socket.io                          | 4.8.3   |
| **Email Service**     | @nestjs-modules/mailer             | 2.3.4   |
| **API Documentation** | Swagger                            | 11.2.6  |
| **Validation**        | class-validator, class-transformer | 0.14.4  |
| **Security**          | Helmet, CSRF Protection            | 8.1.0   |
| **Rate Limiting**     | @nestjs/throttler                  | 6.5.0   |
| **Testing**           | Jest                               | 30.0.0  |
| **Code Quality**      | ESLint, Prettier                   | Latest  |

---

## 🎯 Key Features

### 🔐 Authentication & Security

- JWT-based authentication with refresh tokens
- Passport.js with multiple strategies (JWT, Google OAuth)
- Role-Based Access Control (RBAC)
- CSRF protection
- Helmet security headers
- Rate limiting on public endpoints

### 🛒 E-Commerce

- Product catalog with categories
- Shopping cart management
- Order processing and tracking
- Order status updates
- Cart persistence

### 💳 Payments

- Stripe integration for payment processing
- Payment webhook handling
- Order payment reconciliation
- Transaction tracking

### 📰 Blog System

- Create, read, update, delete blog posts
- Category management
- Public blog access
- Admin moderation

### 🖼️ Portfolio & Services

- Portfolio showcase
- Service listing and management
- Service order booking
- Service details with metadata

### 🔔 Notifications & Real-time

- WebSocket support for live updates
- Email notifications
- In-app notifications system
- User preferences for notification channels

### 👥 User Management

- User registration and profile management
- User status tracking
- Admin dashboard for user oversight
- User preference management

### 📊 Admin Dashboard

- Overview and analytics
- User management interface
- Order management
- Content moderation

### 💬 Contact & Support

- Contact form submissions
- Message routing and storage
- Admin notification on new contacts

---

## 📁 Project Structure

```
src/
├── auth/                          # Authentication module
│   ├── decorators/               # Custom decorators (e.g., @CurrentUser)
│   ├── dto/                      # DTOs for auth endpoints
│   ├── guards/                   # Auth guards (JWT, Role-based)
│   ├── schema/                   # Auth database schema
│   ├── strategies/               # Passport strategies
│   └── types/                    # TypeScript types
│
├── user/                         # User management module
├── blog/                         # Blog management module
│   ├── blog.controller.ts        # Public blog endpoints
│   ├── blog.public.controller.ts # Authenticated blog endpoints
│   └── ...
│
├── cart/                         # Shopping cart module
├── categories/                   # Product categories
├── contact/                      # Contact form handling
├── dashboard/                    # Admin dashboard module
├── notifications/                # Notification system
├── payments/                     # Payment processing
├── stripe/                       # Stripe-specific integration
├── portfolio/                    # Portfolio management
├── service-orders/              # Service booking
├── services/                     # Services management
│
├── config/                       # Configuration files
│   ├── database.config.ts       # TypeORM database setup
│   ├── stripe.config.ts         # Stripe configuration
│   ├── mail.config.ts           # Email configuration
│   ├── ws.config.ts             # WebSocket configuration
│   ├── event-emitter.config.ts  # Event handling setup
│   └── throttler.config.ts      # Rate limiting
│
├── common/                       # Shared utilities
│   ├── dto/                     # Common DTOs (pagination, etc.)
│   └── utils/                   # Helper functions
│
├── db/                          # Database
│   └── migrations/              # TypeORM migrations
│
├── helpers/                     # Utility helpers
├── interfaces/                  # TypeScript interfaces
├── mail/                        # Email templates and logic
├── seeders/                     # Database seeders
│
├── app.module.ts               # Root application module
├── app.controller.ts           # Root controller
├── app.service.ts              # Root service
└── main.ts                     # Application entry point

docs/                           # API documentation
├── auth-api.md
├── user-api.md
├── payments-api.md
├── blog-api.md
├── services-api.md
└── ...

integrations/                   # Integration plans
├── AUTH_PLAN.md
├── STRIPE_INTEGRATION.md
└── ...

db/migrations/                  # Database migration files
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- **PostgreSQL** (remote or local)
- **npm** or **pnpm** (package manager)
- **Stripe Account** (for payment processing)
- **Google OAuth Credentials** (for social login)
- **SMTP Server** (for email notifications)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
pnpm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sanad_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=3600

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Email Configuration
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASSWORD=your-password
MAIL_FROM=noreply@sanad.com

# Node Environment
NODE_ENV=development

# API Configuration
API_URL=http://localhost:3000
API_PORT=3000

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

### Database Setup

```bash
# Run migrations
pnpm run migration:run

# Seed initial data
pnpm run seed

# Seed categories specifically
pnpm run seed:categories
```

---

## 📝 Available Scripts

### Development

```bash
# Start development server with watch mode
pnpm run start:dev

# Start debug mode
pnpm run start:debug

# Format code with Prettier
pnpm run format

# Lint code with ESLint
pnpm run lint
```

### Production

```bash
# Build for production
pnpm run build

# Start production server
pnpm run start:prod
```

### Testing

```bash
# Run unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov

# Run debug tests
pnpm run test:debug

# Run end-to-end tests
pnpm run test:e2e
```

### Database

```bash
# Generate a new migration
pnpm run migration:generate -- -n MigrationName

# Create an empty migration
pnpm run migration:create -- -n MigrationName

# Run pending migrations
pnpm run migration:run

# Revert the last migration
pnpm run migration:revert

# Seed the database
pnpm run seed
```

---

## 🔌 API Endpoints

The API is organized into domain-specific modules. Full endpoint documentation available in `/docs` folder:

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/google` - Google OAuth login

### Users

- `GET /users` - List users (admin)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user (admin)

### Products & Cart

- `GET /categories` - List categories
- `GET /products` - List products
- `POST /cart` - Add to cart
- `GET /cart` - Get cart contents
- `DELETE /cart/:id` - Remove from cart

### Orders

- `POST /orders` - Create order
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status

### Payments

- `POST /payments` - Initiate payment
- `POST /payments/webhook` - Stripe webhook
- `GET /payments/:id` - Get payment status

### Blog

- `GET /blog` - List blog posts
- `GET /blog/:id` - Get blog post
- `POST /blog` - Create post (authenticated)
- `PATCH /blog/:id` - Update post
- `DELETE /blog/:id` - Delete post

### Services & Portfolio

- `GET /services` - List services
- `POST /service-orders` - Book a service
- `GET /portfolio` - Portfolio items

### Notifications

- `GET /notifications` - Get user notifications
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /preferences` - Update notification preferences

### Dashboard

- `GET /dashboard/stats` - Admin statistics
- `GET /dashboard/users` - User overview
- `GET /dashboard/orders` - Order overview

### Contact

- `POST /contact` - Submit contact form
- `GET /contact` - List submissions (admin)

---

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. User registers or logs in
2. Server returns JWT token + refresh token
3. Client includes JWT in `Authorization: Bearer <token>` header
4. Server validates token on protected routes
5. Use refresh token to get new JWT when expired

**Protected Routes** require:

- Valid JWT token
- Optional: Specific roles/permissions (RBAC)

---

## 🔄 Real-time Features

Socket.io enables real-time communication:

```typescript
// Connect to WebSocket
const socket = io('http://localhost:3000');

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Listen for order updates
socket.on('order:updated', (order) => {
  console.log('Order status changed:', order);
});
```

---

## 💳 Payment Integration

Stripe webhooks handle:

- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed

Webhook endpoint: `POST /payments/webhook`

---

## 📧 Email Configuration

Emails are sent for:

- User registration confirmation
- Password reset
- Order confirmation
- Order status updates
- Notification digests

---

## 📚 Modules Architecture

Each module follows NestJS best practices:

```
module/
├── module.controller.ts       # HTTP request handling
├── module.service.ts          # Business logic
├── module.module.ts           # Module definition
├── dto/                        # Data Transfer Objects
├── schema/                     # Database entities
└── module.spec.ts             # Unit tests
```

### Module Patterns

- **Controllers** → HTTP handlers (thin layer)
- **Services** → Business logic (transactional)
- **DTOs** → Request/response validation
- **Entities** → Database schema definition
- **Guards** → Authentication & authorization
- **Pipes** → Input validation & transformation

---

## 🧪 Testing Strategy

- **Unit Tests**: Service logic, utilities
- **Integration Tests**: Service + database interactions
- **E2E Tests**: Complete request flows

Run tests:

```bash
pnpm run test              # Unit tests
pnpm run test:e2e          # E2E tests
pnpm run test:cov          # Coverage report
```

---

## 📖 Swagger API Documentation

Interactive API docs available at `http://localhost:3000/api`:

```bash
pnpm run start:dev
# Navigate to http://localhost:3000/api
```

---

## 🔒 Security Best Practices

✅ **Implemented**

- JWT authentication with HTTPS
- Helmet security headers
- CSRF protection
- Rate limiting on public endpoints
- Input validation with class-validator
- Password hashing with Argon2
- SQL injection prevention via TypeORM
- Google OAuth for secure social login

⚠️ **Guidelines**

- Never commit `.env` files
- Rotate JWT secrets periodically
- Use HTTPS in production
- Validate all user inputs
- Implement proper CORS policies
- Monitor Stripe webhooks

---

## 🚀 Deployment

### Prerequisites

- PostgreSQL database (cloud or self-hosted)
- Stripe account with API keys
- Email service (SMTP or SendGrid)
- Node.js runtime environment

### Deployment Steps

1. **Build the application**

   ```bash
   pnpm run build
   ```

2. **Set environment variables** on production server

3. **Run migrations**

   ```bash
   pnpm run migration:run
   ```

4. **Start the server**
   ```bash
   pnpm run start:prod
   ```

### Environment-Specific Configuration

- Development: Hot reload, verbose logging
- Production: Optimized build, security headers, error tracking

---

## 📊 Database Schema

Key entities:

- **Users** - User accounts & authentication
- **Categories** - Product/service categories
- **Products** - E-commerce products
- **Cart** - User shopping carts
- **Orders** - Order management
- **Payments** - Payment transactions
- **Blog** - Blog posts & comments
- **Services** - Service listings
- **ServiceOrders** - Service bookings
- **Portfolio** - Portfolio items
- **Notifications** - User notifications
- **Contacts** - Contact form submissions

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Code Standards

- Follow ESLint configuration
- Write unit tests for new features
- Use TypeScript strict mode
- Document complex logic with comments
- Follow NestJS module conventions

---

## 📝 Integration Plans

Detailed integration documentation available in `/integrations`:

- `AUTH_PLAN.md` - Authentication flow
- `STRIPE_INTEGRATION.md` - Payment processing
- `BLOG_PLAN.md` - Blog system setup
- `NOTIFICATIONS_INTEGRATION_PLAN.md` - Real-time notifications
- And more...

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Verify DATABASE_URL in .env
# Check PostgreSQL is running
psql -U postgres -h localhost
```

### Migration Errors

```bash
# Revert last migration
pnpm run migration:revert

# Regenerate migrations
pnpm run migration:generate -- -n FixName
```

### Port Already in Use

```bash
# Change API_PORT in .env or kill process
lsof -i :3000
kill -9 <PID>
```

---

## 📞 Support

For issues, questions, or contributions:

- Check `/integrations` and `/docs` folders for detailed guides
- Review TypeORM and NestJS documentation
- Check error logs for detailed error messages

---

## 📄 License

This project is **UNLICENSED** and proprietary.

---

## 🎯 Roadmap

- [ ] GraphQL API alternative
- [ ] Advanced analytics & reporting
- [ ] Mobile app support
- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] AI-powered recommendations
- [ ] Enhanced admin dashboard with charts

---

**Built with ❤️ using NestJS & TypeScript**
