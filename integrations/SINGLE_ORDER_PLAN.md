# Single Order — Integration Plan

## Overview

This document covers the three admin-level actions available on a single service order. These endpoints are used inside the **Admin Dashboard** when managing individual orders.

---

## 1. Data Models

### ServiceOrder Entity

```typescript
interface ServiceOrder {
  id: string;                      // UUID
  userId: number;                  // FK to User
  serviceId: string;               // FK to Service (UUID)
  paymentId: string | null;       // FK to Payment (UUID, unique, nullable)
  status: OrderStatus;             // One of: pending | paid | in_progress | completed | cancelled
  amount: number;                 // Decimal (precision 12, scale 2)
  currency: string;               // Default: "usd"
  notes: string | null;           // Optional user notes
  service: Service;               // Eager-loaded relation
  user: User;                     // Relation (admin view only)
  payment: Payment | null;        // Relation (admin view only)
  updates: OrderUpdate[];          // Timeline entries
  createdAt: Date;
  updatedAt: Date;
}
```

### OrderUpdate Entity

```typescript
interface OrderUpdate {
  id: string;          // UUID
  orderId: string;     // FK to ServiceOrder
  author: UpdateAuthor; // One of: user | admin | system
  content: string;     // Timeline message text
  createdAt: Date;
}
```

### Enums

```typescript
enum OrderStatus {
  PENDING    = 'pending',
  PAID       = 'paid',
  IN_PROGRESS = 'in_progress',
  COMPLETED  = 'completed',
  CANCELLED  = 'cancelled',
}

enum UpdateAuthor {
  USER   = 'user',
  ADMIN  = 'admin',
  SYSTEM = 'system',
}
```

### PaginationMeta

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
  perPage: number;
}
```

---

## 2. Backend API Endpoints

---

### `GET /admin/orders/:id`

Retrieves the full details of a single order including the service, user, payment, and the complete timeline of updates. Requires admin access.

**Path Parameters:**

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| `id`      | string (UUID) | Yes    | Order UUID            |

**Example Request:**
```
GET /admin/orders/550e8400-e29b-41d4-a716-446655440000
```

**Success Response (`200 OK`):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": 12,
  "serviceId": "660f9511-f3ac-52e5-b827-557766551111",
  "paymentId": "770a0622-g4bd-63f6-c938-668877662222",
  "status": "paid",
  "amount": 499.99,
  "currency": "usd",
  "notes": "Please prioritize this order.",
  "createdAt": "2026-04-01T10:00:00.000Z",
  "updatedAt": "2026-04-03T14:30:00.000Z",
  "service": {
    "id": "660f9511-f3ac-52e5-b827-557766551111",
    "title": "Web Development",
    "slug": "web-development",
    "shortDescription": "Full-stack web application development.",
    "basePrice": 499.99,
    "isPublished": true
  },
  "user": {
    "id": 12,
    "fullName": "Ahmed Hassan",
    "email": "ahmed@example.com"
  },
  "payment": {
    "id": "770a0622-g4bd-63f6-c938-668877662222",
    "status": "succeeded",
    "amount": 499.99,
    "currency": "usd",
    "createdAt": "2026-04-01T10:05:00.000Z"
  },
  "updates": [
    {
      "id": "880b0733-h5ce-74g7-d049-779988773333",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "author": "system",
      "content": "Order created for service \"Web Development\".",
      "createdAt": "2026-04-01T10:00:00.000Z"
    },
    {
      "id": "990c1844-i6df-85h8-e150-880099884444",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "author": "system",
      "content": "Payment confirmed. Your order is now being processed.",
      "createdAt": "2026-04-01T10:05:00.000Z"
    }
  ]
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "id must be a UUID", "error": "Bad Request"}` |
| `404 Not Found` | `{"statusCode": 404, "message": "Order \"550e8400-e29b-41d4-a716-446655440000\" not found", "error": "Not Found"}` |

---

### `PATCH /admin/orders/:id/status`

Updates the status of a single order. Automatically appends a system timeline entry recording the status change. Requires admin access.

**Path Parameters:**

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| `id`      | string (UUID) | Yes    | Order UUID            |

**Request Body:**

| Field   | Type                          | Required | Description                                 |
|---------|-------------------------------|----------|---------------------------------------------|
| `status`| `OrderStatus` (enum string)   | Yes      | New status. One of: `pending`, `paid`, `in_progress`, `completed`, `cancelled` |

**Example Request:**
```json
{
  "status": "in_progress"
}
```

**Success Response (`200 OK`):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": 12,
  "serviceId": "660f9511-f3ac-52e5-b827-557766551111",
  "paymentId": "770a0622-g4bd-63f6-c938-668877662222",
  "status": "in_progress",
  "amount": 499.99,
  "currency": "usd",
  "notes": "Please prioritize this order.",
  "createdAt": "2026-04-01T10:00:00.000Z",
  "updatedAt": "2026-04-05T09:00:00.000Z",
  "service": {
    "id": "660f9511-f3ac-52e5-b827-557766551111",
    "title": "Web Development",
    "slug": "web-development",
    "shortDescription": "Full-stack web application development.",
    "basePrice": 499.99,
    "isPublished": true
  },
  "user": {
    "id": 12,
    "fullName": "Ahmed Hassan",
    "email": "ahmed@example.com"
  },
  "payment": {
    "id": "770a0622-g4bd-63f6-c938-668877662222",
    "status": "succeeded",
    "amount": 499.99,
    "currency": "usd",
    "createdAt": "2026-04-01T10:05:00.000Z"
  },
  "updates": [
    {
      "id": "880b0733-h5ce-74g7-d049-779988773333",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "author": "system",
      "content": "Order created for service \"Web Development\".",
      "createdAt": "2026-04-01T10:00:00.000Z"
    },
    {
      "id": "990c1844-i6df-85h8-e150-880099884444",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "author": "system",
      "content": "Payment confirmed. Your order is now being processed.",
      "createdAt": "2026-04-01T10:05:00.000Z"
    },
    {
      "id": "aa1c2955-j7eg-96i9-f261-991100995555",
      "orderId": "550e8400-e29b-41d4-a716-446655440000",
      "author": "admin",
      "content": "Order status changed from \"paid\" to \"in_progress\".",
      "createdAt": "2026-04-05T09:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": ["status must be one of: pending, paid, in_progress, completed, cancelled"], "error": "Bad Request"}` |
| `404 Not Found` | `{"statusCode": 404, "message": "Order \"550e8400-e29b-41d4-a716-446655440000\" not found", "error": "Not Found"}` |

---

### `POST /admin/orders/:id/updates`

Adds a new timeline entry (admin note) to a specific order. Requires admin access.

**Path Parameters:**

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| `id`      | string (UUID) | Yes    | Order UUID            |

**Request Body:**

| Field     | Type   | Required | Constraints     | Description                  |
|-----------|--------|----------|-----------------|------------------------------|
| `content` | string | Yes      | Min: 1, Max: 2000 chars | Timeline message text |

**Example Request:**
```json
{
  "content": "We have started working on your project. Expect delivery within 5 business days."
}
```

**Success Response (`201 Created`):**
```json
{
  "id": "bb2d3066-k8fh-07j0-g372-002211006666",
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "author": "admin",
  "content": "We have started working on your project. Expect delivery within 5 business days.",
  "createdAt": "2026-04-05T11:30:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": ["content must be longer than or equal to 1 characters", "content must be shorter than or equal to 2000 characters"], "error": "Bad Request"}` |
| `404 Not Found` | `{"statusCode": 404, "message": "Order \"550e8400-e29b-41d4-a716-446655440000\" not found", "error": "Not Found"}` |

---

## 3. Key Business Rules

| Rule | Details |
|------|---------|
| **UUID validation** | All `:id` path params must be valid UUIDs. Non-UUID values return `400`. |
| **Status enum** | Only valid `OrderStatus` values are accepted (`pending`, `paid`, `in_progress`, `completed`, `cancelled`). |
| **Timeline auto-entry on status change** | Calling `PATCH /admin/orders/:id/status` automatically creates a system timeline entry with the previous and new status. |
| **Author is always `admin`** | `POST /admin/orders/:id/updates` always saves the entry with `author: "admin"`. |
| **Content length** | Timeline messages are capped at 2000 characters. |
| **404 on missing order** | All three endpoints throw `404 Not Found` if the order UUID does not exist. |
| **Eager-loaded relations on get** | `GET /admin/orders/:id` returns `service`, `user`, `payment`, and `updates` in a single response. |
