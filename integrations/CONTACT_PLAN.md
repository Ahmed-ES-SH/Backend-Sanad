# Contact Module Integration Plan

## 1. Overview

This document details the integration strategy for the Contact module between the Next.js frontend and the NestJS backend. It covers the public contact form for visitors and the admin dashboard for managing incoming messages.

**Naming conventions:**

| Layer | Path Prefix |
|-------|------------|
| Public routes | `/contact` |
| Dashboard routes | `/dashboard/contact` |
| Backend endpoints (admin) | `/admin/contact` |
| Backend endpoints (public) | `/contact` |

Admin operations require a `Bearer` auth token. The public submit endpoint is rate-limited to 5 requests per hour per IP.

**Data model — `ContactMessage` entity:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `fullName` | varchar(100) | Required |
| `email` | varchar(255) | Required, email format |
| `subject` | varchar(200) | Required |
| `message` | text | Required |
| `isRead` | boolean | Default `false` |
| `repliedAt` | timestamp | Nullable, set on mark-as-replied |
| `ipAddress` | varchar(45) | Auto-captured on submit |
| `createdAt` | timestamp | Auto-set |
| `updatedAt` | timestamp | Auto-set |

---

## 2. Public Endpoints

### 2.1 `POST /contact`

**Purpose:** Submit a new contact message.

**Controller:** `ContactPublicController.create`

**Authentication:** None (public)

**Rate limiting:** Max 5 submissions per hour per IP.

**Request body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `fullName` | string | Yes | Max 100 chars |
| `email` | string | Yes | Valid email, max 255 chars |
| `subject` | string | Yes | Max 200 chars |
| `message` | string | Yes | — |

**Request body example:**

```json
{
  "fullName": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "subject": "Website Development Inquiry",
  "message": "I would like to discuss building a custom web application for my business."
}
```

**Response example (201):**

```json
{
  "message": "Your message has been sent successfully",
  "id": "d4e5f6a7-b8c9-0123-defa-bc4567890123"
}
```

**Error response (400):**

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "fullName must not be longer than 100 characters"
  ],
  "error": "Bad Request"
}
```

**Error response (429):**

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded — max 5 per hour",
  "error": "Too Many Requests"
}
```

---

## 3. Admin Endpoints

### 3.1 `GET /admin/contact`

**Purpose:** List all contact messages with pagination and optional filtering.

**Controller:** `ContactController.findAll`

**Authentication:** Required (ADMIN role)

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max `100`) |
| `sortBy` | string | `createdAt` | One of: `createdAt`, `updatedAt` |
| `order` | string | `DESC` | `ASC` or `DESC` |
| `isRead` | boolean | — | Filter by read status |

**Query examples:**

```
GET /admin/contact                             → all messages
GET /admin/contact?isRead=false                 → unread only
GET /admin/contact?page=1&limit=5&order=ASC     → oldest first
```

**Response example (200):**

```json
{
  "data": [
    {
      "id": "d4e5f6a7-b8c9-0123-defa-bc4567890123",
      "fullName": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "subject": "Website Development Inquiry",
      "message": "I would like to discuss building a custom web application.",
      "isRead": false,
      "repliedAt": null,
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-01-20T09:00:00.000Z",
      "updatedAt": "2026-01-20T09:00:00.000Z"
    },
    {
      "id": "e5f6a7b8-c9d0-1234-efab-cd5678901234",
      "fullName": "Sara Ali",
      "email": "sara@example.com",
      "subject": "Support Request",
      "message": "I need help with my existing project.",
      "isRead": true,
      "repliedAt": "2026-01-19T14:00:00.000Z",
      "ipAddress": "192.168.1.2",
      "createdAt": "2026-01-19T10:00:00.000Z",
      "updatedAt": "2026-01-19T14:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 3.2 `GET /admin/contact/:id`

**Purpose:** Get details of a single contact message.

**Controller:** `ContactController.findOne`

**Authentication:** Required (ADMIN role)

**Path parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Contact message ID |

**Response example (200):**

```json
{
  "id": "d4e5f6a7-b8c9-0123-defa-bc4567890123",
  "fullName": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "subject": "Website Development Inquiry",
  "message": "I would like to discuss building a custom web application for my business.",
  "isRead": false,
  "repliedAt": null,
  "ipAddress": "192.168.1.1",
  "createdAt": "2026-01-20T09:00:00.000Z",
  "updatedAt": "2026-01-20T09:00:00.000Z"
}
```

**Error response (404):**

```json
{
  "statusCode": 404,
  "message": "Contact message not found",
  "error": "Not Found"
}
```

---

### 3.3 `PATCH /admin/contact/:id/read`

**Purpose:** Mark a message as read (one-way toggle).

**Controller:** `ContactController.markAsRead`

**Authentication:** Required (ADMIN role)

**Response example (200):**

```json
{
  "id": "d4e5f6a7-b8c9-0123-defa-bc4567890123",
  "isRead": true,
  "message": "Message marked as read"
}
```

---

### 3.4 `PATCH /admin/contact/:id/reply`

**Purpose:** Mark a message as replied. Also sets `isRead` to `true` and records the current timestamp in `repliedAt`.

**Controller:** `ContactController.markAsReplied`

**Authentication:** Required (ADMIN role)

**Response example (200):**

```json
{
  "id": "d4e5f6a7-b8c9-0123-defa-bc4567890123",
  "isRead": true,
  "repliedAt": "2026-01-21T15:30:00.000Z",
  "message": "Message marked as replied"
}
```

---

### 3.5 `DELETE /admin/contact/:id`

**Purpose:** Delete a contact message permanently.

**Controller:** `ContactController.remove`

**Authentication:** Required (ADMIN role)

**Response example (200):**

```json
{
  "message": "Contact message deleted successfully"
}
```

**Error response (404):**

```json
{
  "statusCode": 404,
  "message": "Contact message not found",
  "error": "Not Found"
}
```

---

## 4. Frontend Mapping

### Public Route (`app/[local]/(routes)/contact`)

| File | Endpoint | Purpose |
|------|----------|---------|
| `contact/page.tsx` | `POST /contact` | Contact form with form validation |

**Implementation notes:**
- Use React Hook Form + Zod for client-side validation
- Submit via Next.js Server Action that calls `POST /contact`
- Show toast notifications for success/error
- Handle rate-limiting (429) with a friendly message
- Translate all labels, placeholders, and errors (`en.json` / `ar.json`)

### Dashboard Route (`app/[local]/dashboard/contact`)

| File | Endpoint | Purpose |
|------|----------|---------|
| `contact/page.tsx` | `GET /admin/contact` | Message inbox table/grid |
| `contact/[id]/page.tsx` | `GET /admin/contact/:id` | Message detail view |

**Implementation notes:**
- Build a data table with unread/read badge indicators
- Filter toolbar with "Unread only" toggle (`?isRead=false`)
- Action buttons: "Mark Read", "Mark Replied", "Delete"
- Slide-over or modal for quick message preview from the table
- SSR with `Bearer` token passed via auth cookies

### Server Actions (`app/actions/contactActions.ts`)

| Action | Endpoint | Side Effect |
|--------|----------|-------------|
| `submitContact(formData)` | `POST /contact` | None (public) |
| `fetchContactMessages(query)` | `GET /admin/contact` | None |
| `fetchContactDetail(id)` | `GET /admin/contact/:id` | None |
| `markAsRead(id)` | `PATCH /admin/contact/:id/read` | `revalidatePath('/dashboard/contact')` |
| `markAsReplied(id)` | `PATCH /admin/contact/:id/reply` | `revalidatePath('/dashboard/contact')` |
| `deleteContactMessage(id)` | `DELETE /admin/contact/:id` | `revalidatePath('/dashboard/contact')` |

---

## 5. Implementation Steps

1. **Contact form UI** — build at `app/[local]/(routes)/contact/page.tsx` with React Hook Form + Zod validation
2. **Submit Server Action** — implement `submitContact()` that calls `POST /contact` and handles 429 rate-limit errors
3. **Admin inbox page** — scaffold `app/[local]/dashboard/contact/page.tsx` with paginated data table, unread badges, and filter controls
4. **Message detail view** — create `dashboard/contact/[id]/page.tsx` for reading full message details with action buttons
5. **Status actions** — wire "Mark Read", "Mark Replied", and "Delete" buttons to corresponding server actions with optimistic UI updates
6. **Localization** — add Arabic/English translations for the form fields, labels, and dashboard UI
7. **About page** — build `app/[local]/(routes)/about/page.tsx` with CTAs linking to `/contact` and `/services`
