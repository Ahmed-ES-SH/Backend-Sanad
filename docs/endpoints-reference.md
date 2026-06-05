# API Endpoints Reference

> Complete list of all API endpoints organized by access level.

**Base URL:** `/api` (adjust based on your environment)

---

## Public Endpoints

> No authentication required. Anyone can access these endpoints.

| Method | Endpoint                         | Description                                   | Rate Limit    |
| ------ | -------------------------------- | --------------------------------------------- | ------------- |
| `POST` | `/contact`                       | Submit a contact form message                 | 5/hour per IP |
| `POST` | `/api/auth/login`                | Login with email & password                   | —             |
| `POST` | `/api/auth/verify-email`         | Verify email with token (query: `?token=xxx`) | —             |
| `POST` | `/api/auth/rest-password/send`   | Send password reset email                     | 3/15min       |
| `POST` | `/api/auth/rest-password/verify` | Verify password reset token                   | 5/15min       |
| `POST` | `/api/auth/rest-password`        | Reset password with token                     | 5/hour        |
| `GET`  | `/api/auth/google`               | Initiate Google OAuth login                   | —             |
| `GET`  | `/api/auth/google/callback`      | Handle Google OAuth callback                  | —             |
| `GET`  | `/services`                      | List all published services                   | —             |
| `GET`  | `/services/:slug`                | Get a published service by slug               | —             |
| `GET`  | `/portfolio`                     | List published projects (with filters)        | —             |
| `GET`  | `/portfolio/:slug`               | Get a published project by slug               | —             |
| `GET`  | `/blog`                          | List published articles (paginated)           | —             |
| `GET`  | `/blog/:slug`                    | Get a published article by slug               | —             |
| `POST` | `/api/stripe/webhook`            | Receive Stripe webhook events                 | —             |

---

## Protected Endpoints

> Require valid JWT token in `Authorization: Bearer <token>` header. Any authenticated user can access.

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| `GET`  | `/api/auth/current-user`  | Get current user profile     |
| `POST` | `/api/auth/logout`        | Logout (blacklist token)     |
| `POST` | `/payments/create-intent` | Create Stripe payment intent |

---

## Admin Endpoints

> Require valid JWT token with `ADMIN` role.

### Portfolio Management

| Method   | Endpoint                       | Description                    |
| -------- | ------------------------------ | ------------------------------ |
| `GET`    | `/admin/portfolio`             | List all projects (paginated)  |
| `POST`   | `/admin/portfolio`             | Create a new project           |
| `PATCH`  | `/admin/portfolio/:id`         | Update a project               |
| `DELETE` | `/admin/portfolio/:id`         | Delete a project               |
| `PATCH`  | `/admin/portfolio/:id/publish` | Toggle project publish status  |
| `PATCH`  | `/admin/portfolio/:id/feature` | Toggle project featured status |
| `PATCH`  | `/admin/portfolio/reorder`     | Batch reorder projects         |

### Services Management

| Method   | Endpoint                      | Description                   |
| -------- | ----------------------------- | ----------------------------- |
| `GET`    | `/admin/services`             | List all services (paginated) |
| `POST`   | `/admin/services`             | Create a new service          |
| `PATCH`  | `/admin/services/:id`         | Update a service              |
| `DELETE` | `/admin/services/:id`         | Delete a service              |
| `PATCH`  | `/admin/services/:id/publish` | Toggle service publish status |
| `PATCH`  | `/admin/services/reorder`     | Batch reorder services        |

### Blog Management

| Method   | Endpoint                  | Description                   |
| -------- | ------------------------- | ----------------------------- |
| `GET`    | `/admin/blog`             | List all articles (paginated) |
| `POST`   | `/admin/blog`             | Create a new article          |
| `PATCH`  | `/admin/blog/:id`         | Update an article             |
| `DELETE` | `/admin/blog/:id`         | Delete an article             |
| `PATCH`  | `/admin/blog/:id/publish` | Toggle article publish status |

### Contact Management

| Method   | Endpoint                   | Description                       |
| -------- | -------------------------- | --------------------------------- |
| `GET`    | `/admin/contact`           | List contact messages (paginated) |
| `GET`    | `/admin/contact/:id`       | Get a single contact message      |
| `PATCH`  | `/admin/contact/:id/read`  | Mark message as read              |
| `PATCH`  | `/admin/contact/:id/reply` | Mark message as replied           |
| `DELETE` | `/admin/contact/:id`       | Delete a contact message          |

### Payments Management

| Method | Endpoint                     | Description                             |
| ------ | ---------------------------- | --------------------------------------- |
| `GET`  | `/admin/payments`            | List all payments (filtered, paginated) |
| `GET`  | `/admin/payments/:id`        | Get a single payment                    |
| `POST` | `/admin/payments/:id/refund` | Refund a succeeded payment              |

### User Management

| Method   | Endpoint        | Description       |
| -------- | --------------- | ----------------- |
| `POST`   | `/api/user`     | Create a new user |
| `GET`    | `/api/user`     | List all users    |
| `GET`    | `/api/user/:id` | Get a user by ID  |
| `PATCH`  | `/api/user/:id` | Update a user     |
| `DELETE` | `/api/user/:id` | Delete a user     |

---

## Quick Reference by Module

### Auth (`/api/auth`)

```
POST   /api/auth/login                  — Login
POST   /api/auth/verify-email?token=    — Verify email
POST   /api/auth/rest-password/send     — Send reset email
POST   /api/auth/rest-password/verify   — Verify reset token
POST   /api/auth/rest-password          — Reset password
GET    /api/auth/google                 — Google OAuth start
GET    /api/auth/google/callback        — Google OAuth callback
GET    /api/auth/current-user           — Get profile (protected)
POST   /api/auth/logout                 — Logout (protected)
```

### Users (`/api/user`)

```
POST   /api/user                        — Create user
GET    /api/user                        — List all users
GET    /api/user/:id                    — Get user
PATCH  /api/user/:id                    — Update user
DELETE /api/user/:id                    — Delete user
```

### Portfolio

```
# Public
GET    /portfolio                       — List published projects
GET    /portfolio/:slug                 — Get project by slug

# Admin
GET    /admin/portfolio                 — List all projects
POST   /admin/portfolio                 — Create project
PATCH  /admin/portfolio/:id             — Update project
DELETE /admin/portfolio/:id             — Delete project
PATCH  /admin/portfolio/:id/publish     — Toggle publish
PATCH  /admin/portfolio/:id/feature     — Toggle featured
PATCH  /admin/portfolio/reorder         — Batch reorder
```

### Services

```
# Public
GET    /services                        — List published services
GET    /services/:slug                  — Get service by slug

# Admin
GET    /admin/services                  — List all services
POST   /admin/services                  — Create service
PATCH  /admin/services/:id              — Update service
DELETE /admin/services/:id              — Delete service
PATCH  /admin/services/:id/publish      — Toggle publish
PATCH  /admin/services/reorder          — Batch reorder
```

### Blog

```
# Public
GET    /blog                            — List published articles
GET    /blog/:slug                      — Get article by slug

# Admin
GET    /admin/blog                      — List all articles
POST   /admin/blog                      — Create article
PATCH  /admin/blog/:id                  — Update article
DELETE /admin/blog/:id                  — Delete article
PATCH  /admin/blog/:id/publish          — Toggle publish
```

### Contact

```
# Public
POST   /contact                         — Submit contact message

# Admin
GET    /admin/contact                   — List messages
GET    /admin/contact/:id               — Get message
PATCH  /admin/contact/:id/read          — Mark as read
PATCH  /admin/contact/:id/reply         — Mark as replied
DELETE /admin/contact/:id               — Delete message
```

### Payments

```
# Protected (any authenticated user)
POST   /payments/create-intent          — Create payment intent

# Admin
GET    /admin/payments                  — List payments
GET    /admin/payments/:id              — Get payment
POST   /admin/payments/:id/refund       — Refund payment

# Webhook (Stripe)
POST   /api/stripe/webhook              — Handle Stripe events
```

---

## Authentication Summary

| Access Level  | Requirement                    | Endpoints Count |
| ------------- | ------------------------------ | --------------- |
| **Public**    | None                           | 15 endpoints    |
| **Protected** | Valid JWT token (any role)     | 3 endpoints     |
| **Admin**     | Valid JWT token + `ADMIN` role | 32 endpoints    |
