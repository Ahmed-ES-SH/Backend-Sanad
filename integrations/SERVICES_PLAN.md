# Services Integration Plan

## 1. Overview

This plan outlines the integration of the Services module between the Next.js frontend and the NestJS backend. We will leverage the Next.js App Router's Server Components for SEO-friendly data fetching and Server Actions for secure mutations (creation, updates, deletions, reordering). All backend interactions inside the Admin Dashboard will utilize the `Bearer` token strategy defined in the `AUTH_PLAN.md`. Only users with the `admin` role can access admin endpoints.

---

## 2. Data Models

### Service Entity

```typescript
interface Service {
  id: string;                      // UUID
  title: string;                   // Max 150 chars
  slug: string;                    // Auto-generated, unique URL-friendly identifier (max 160 chars)
  shortDescription: string;        // Brief summary (required before publishing)
  longDescription: string | null;  // Detailed description
  iconUrl: string | null;          // Icon image URL from cloud storage (max 255 chars)
  coverImageUrl: string | null;    // Cover image URL from cloud storage (max 255 chars)
  categoryId: string | null;       // FK to Category
  category: Category | null;       // Relation (joined on demand)
  isPublished: boolean;            // Published or draft
  order: number;                   // Display order (default: 0)
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Entity (Relation)

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
}
```

### Pagination Meta

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### Reorder Item

```typescript
interface ReorderItem {
  id: string;    // Service UUID
  order: number; // New display order position (min: 0)
}
```

---

## 3. Backend API Endpoints

### 3.1 Public Endpoints (`/services`)

These endpoints do not require authentication and are accessible to all visitors. Rate limiting is applied via `@nestjs/throttler`.

---

#### `GET /services`

Fetches all published services sorted by display order (ascending). No pagination — returns all published services.

**Example Request:**
```
GET /services
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Web Development",
      "slug": "web-development",
      "shortDescription": "Full-stack web application development using modern frameworks.",
      "longDescription": "<p>Our web development service covers everything from simple landing pages to complex enterprise applications...</p>",
      "iconUrl": "https://cdn.example.com/icons/web.svg",
      "coverImageUrl": "https://cdn.example.com/covers/web-dev.jpg",
      "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "category": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Development",
        "slug": "development"
      },
      "isPublished": true,
      "order": 1,
      "createdAt": "2026-01-10T09:00:00.000Z",
      "updatedAt": "2026-03-20T14:30:00.000Z"
    },
    {
      "id": "660f9511-f3ac-52e5-b827-557766551111",
      "title": "Mobile App Development",
      "slug": "mobile-app-development",
      "shortDescription": "Cross-platform mobile applications for iOS and Android.",
      "longDescription": null,
      "iconUrl": "https://cdn.example.com/icons/mobile.svg",
      "coverImageUrl": null,
      "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "category": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Development",
        "slug": "development"
      },
      "isPublished": true,
      "order": 2,
      "createdAt": "2026-02-05T11:00:00.000Z",
      "updatedAt": "2026-02-05T11:00:00.000Z"
    }
  ]
}
```

**Empty Response (200 OK):**
```json
{
  "data": []
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `429 Too Many Requests` | Rate limit exceeded |

---

#### `GET /services/:slug`

Fetches a single published service by its URL-friendly slug.

**Path Parameters:**

| Parameter | Type   | Required | Description            |
|-----------|--------|----------|------------------------|
| `slug`    | string | Yes      | Service slug (e.g., `web-development`) |

**Example Request:**
```
GET /services/web-development
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Web Development",
  "slug": "web-development",
  "shortDescription": "Full-stack web application development using modern frameworks.",
  "longDescription": "<p>Our web development service covers everything from simple landing pages to complex enterprise applications...</p>",
  "iconUrl": "https://cdn.example.com/icons/web.svg",
  "coverImageUrl": "https://cdn.example.com/covers/web-dev.jpg",
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "category": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Development",
    "slug": "development"
  },
  "isPublished": true,
  "order": 1,
  "createdAt": "2026-01-10T09:00:00.000Z",
  "updatedAt": "2026-03-20T14:30:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `404 Not Found` | `{"statusCode": 404, "message": "Published service with slug \"wrong-slug\" not found", "error": "Not Found"}` |
| `429 Too Many Requests` | Rate limit exceeded |

---

### 3.2 Admin Endpoints (`/admin/services`)

All endpoints require:
- **JWT Authentication** — `Authorization: Bearer <token>` header
- **Admin Role** — Only users with `role: "admin"` can access

---

#### `GET /admin/services`

Lists all services (including drafts) with pagination and sorting. Returns full service data.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**

| Parameter | Type   | Required | Default     | Description                  |
|-----------|--------|----------|-------------|------------------------------|
| `page`    | number | No       | `1`         | Page number (min: 1)         |
| `limit`   | number | No       | `10`        | Items per page (min: 1, max: 100) |
| `sortBy`  | string | No       | `createdAt` | One of: `createdAt`, `updatedAt`, `title`, `order` |
| `order`   | string | No       | `DESC`      | Sort order: `ASC` or `DESC`  |

**Example Request:**
```
GET /admin/services?page=1&limit=10&sortBy=order&order=ASC
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Web Development",
      "slug": "web-development",
      "shortDescription": "Full-stack web application development using modern frameworks.",
      "longDescription": "<p>Our web development service covers...</p>",
      "iconUrl": "https://cdn.example.com/icons/web.svg",
      "coverImageUrl": "https://cdn.example.com/covers/web-dev.jpg",
      "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "category": null,
      "isPublished": true,
      "order": 1,
      "createdAt": "2026-01-10T09:00:00.000Z",
      "updatedAt": "2026-03-20T14:30:00.000Z"
    },
    {
      "id": "770a0622-g4bd-63f6-c938-668877662222",
      "title": "Draft: Cloud Consulting",
      "slug": "draft-cloud-consulting",
      "shortDescription": "Cloud infrastructure consulting.",
      "longDescription": null,
      "iconUrl": null,
      "coverImageUrl": null,
      "categoryId": null,
      "category": null,
      "isPublished": false,
      "order": 0,
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z"
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

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": ["limit must not be greater than 100"], "error": "Bad Request"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `POST /admin/services`

Creates a new service. Services are created as **drafts** by default (`isPublished: false`) with `order: 0`.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

| Field             | Type   | Required | Max Length | Description                          |
|-------------------|--------|----------|------------|--------------------------------------|
| `title`           | string | Yes      | 150        | Service title                        |
| `shortDescription`| string | Yes      | —          | Brief summary of the service         |
| `longDescription` | string | No       | —          | Detailed description (HTML/rich text)|
| `iconUrl`         | string | No       | 255        | Icon image URL                       |
| `coverImageUrl`   | string | No       | 255        | Cover image URL                      |
| `categoryId`      | string (UUID) | No | —        | Category ID                          |

**Example Request:**
```json
{
  "title": "Web Development",
  "shortDescription": "Full-stack web application development using modern frameworks.",
  "longDescription": "<p>Our web development service covers everything from simple landing pages to complex enterprise applications...</p>",
  "iconUrl": "https://cdn.example.com/icons/web.svg",
  "coverImageUrl": "https://cdn.example.com/covers/web-dev.jpg",
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Success Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Web Development",
  "slug": "web-development",
  "shortDescription": "Full-stack web application development using modern frameworks.",
  "longDescription": "<p>Our web development service covers everything from simple landing pages to complex enterprise applications...</p>",
  "iconUrl": "https://cdn.example.com/icons/web.svg",
  "coverImageUrl": "https://cdn.example.com/covers/web-dev.jpg",
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "category": null,
  "isPublished": false,
  "order": 0,
  "createdAt": "2026-04-07T14:30:00.000Z",
  "updatedAt": "2026-04-07T14:30:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": ["title must be shorter than 150 characters", "shortDescription should not be empty"], "error": "Bad Request"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `PATCH /admin/services/:id`

Updates an existing service. Only provided fields are updated (partial update). If the title changes, the slug is auto-regenerated to remain unique.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type | Required | Description     |
|-----------|------|----------|-----------------|
| `id`      | string (UUID) | Yes | Service UUID |

**Example Request:**
```json
{
  "title": "Updated: Full-Stack Web Development",
  "shortDescription": "Enterprise-grade web applications with React and NestJS."
}
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated: Full-Stack Web Development",
  "slug": "updated-full-stack-web-development",
  "shortDescription": "Enterprise-grade web applications with React and NestJS.",
  "longDescription": "<p>Our web development service covers everything from simple landing pages to complex enterprise applications...</p>",
  "iconUrl": "https://cdn.example.com/icons/web.svg",
  "coverImageUrl": "https://cdn.example.com/covers/web-dev.jpg",
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "category": null,
  "isPublished": false,
  "order": 0,
  "createdAt": "2026-04-07T14:30:00.000Z",
  "updatedAt": "2026-04-07T15:45:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | Validation error |
| `404 Not Found` | `{"statusCode": 404, "message": "Service with ID \"invalid-uuid\" not found", "error": "Not Found"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `PATCH /admin/services/:id/publish`

Toggles the publish status of a service. Requires `title` and `shortDescription` before allowing publish.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type | Required | Description     |
|-----------|------|----------|-----------------|
| `id`      | string (UUID) | Yes | Service UUID |

**Success Response — Publishing (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "isPublished": true,
  "message": "Service published successfully"
}
```

**Success Response — Unpublishing (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "isPublished": false,
  "message": "Service unpublished successfully"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "Service must have a title and short description before publishing", "error": "Bad Request"}` |
| `404 Not Found` | `{"statusCode": 404, "message": "Service with ID \"invalid-uuid\" not found", "error": "Not Found"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `PATCH /admin/services/reorder`

Batch-reorders multiple services atomically using a database transaction. Accepts an array of `{ id, order }` pairs.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

| Field    | Type              | Required | Description                              |
|----------|-------------------|----------|------------------------------------------|
| `items`  | ReorderItem[]     | Yes      | Array of service IDs with new order positions |

**ReorderItem:**

| Field   | Type   | Required | Description                     |
|---------|--------|----------|---------------------------------|
| `id`    | string (UUID) | Yes | Service ID                   |
| `order` | number | Yes      | New display order position (min: 0) |

**Example Request:**
```json
{
  "items": [
    { "id": "550e8400-e29b-41d4-a716-446655440000", "order": 0 },
    { "id": "660f9511-f3ac-52e5-b827-557766551111", "order": 1 },
    { "id": "770a0622-g4bd-63f6-c938-668877662222", "order": 2 }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "message": "Services reordered successfully"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": ["items must be an array", "each item.order must not be less than 0"], "error": "Bad Request"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `DELETE /admin/services/:id`

Permanently deletes a service by ID.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type | Required | Description     |
|-----------|------|----------|-----------------|
| `id`      | string (UUID) | Yes | Service UUID |

**Success Response (200 OK):**
```json
{
  "message": "Service deleted successfully"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `404 Not Found` | `{"statusCode": 404, "message": "Service with ID \"invalid-uuid\" not found", "error": "Not Found"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

## 4. Server Components & Data Fetching

Next.js caching features will provide optimal performance and strict revalidation on content updates.

### Public Client Directory: `app/[local]/(routes)/services`

- **`services/page.tsx`** — Uses `GET /services` to list all published services. Tied to Next.js Cache tags (e.g., `next: { tags: ['published-services'] }`).
- **`services/[serviceSlug]/page.tsx`** — Dynamically generates the individual service page by fetching from `GET /services/:slug`. Employs dynamic SEO headers based on the fetched data.

### Dashboard Admin Directory: `app/[local]/dashboard/services`

- **`dashboard/services/page.tsx`** — Uses `GET /admin/services`. Renders the complete service inventory in a management table format with drag-and-drop reordering. Requires the Authorization header.
- **`dashboard/services/[serviceId]/page.tsx`** — Uses `PATCH /admin/services/:id` for updates. Server fetches corresponding service data and pre-populates the form for modifications.

---

## 5. Creating the Add Service Page

A dedicated content creation page must be established in the dashboard.

- **Path:** `app/[local]/dashboard/services/new/page.tsx`
- **Functionality:** This UI will feature form inputs for service title, short description, long description (rich text editor), icon upload, cover image upload, and category selection.
- **Integration:** The form submission will trigger a Next.js Server Action invoking the `POST /admin/services` endpoint.

---

## 6. Server Actions (Mutations)

To safely run backend modifications without exposing the token, all dashboard changes will use a dedicated action file: `app/actions/servicesActions.ts`.

**Planned Actions:**

| Action | Backend Endpoint | Description |
|--------|-----------------|-------------|
| `createService(data)` | `POST /admin/services` | Creates a new draft service |
| `updateService(id, data)` | `PATCH /admin/services/:id` | Updates an existing service. Triggers cache invalidation on success. |
| `deleteService(id)` | `DELETE /admin/services/:id` | Permanently deletes a service |
| `togglePublishService(id)` | `PATCH /admin/services/:id/publish` | Toggles published status. Triggers cache invalidation on success. |
| `reorderServices(items)` | `PATCH /admin/services/reorder` | Batch-reorders services. Triggers cache invalidation on success. |

All mutations making physical data state changes will run `revalidateTag('published-services')` on success to update the public-facing interface without requiring an explicit deployment.

---

## 7. Missing Elements & UI Requirements

By reviewing the existing structure, the following elements need to be verified or created:

1. **Dashboard Create Flow:**
   - The current admin folder structure has `[serviceId]`, but is there a dedicated `/new` route?
   - *Action:* We need to ensure navigating to `/dashboard/services/new` properly loads the Service creation form (reusing the `[serviceId]/page.tsx` component logic if `serviceId === 'new'`).

2. **Reordering Interface:**
   - The `PATCH /admin/services/reorder` endpoint exists, but the dashboard needs a drag-and-drop table/list component (preferably using something like `@hello-pangea/dnd` or `dnd-kit`) to visually reorder services.

3. **Status/Publish Toggle:**
   - Action buttons in the `dashboard/services/page.tsx` table to quickly toggle the Published/Draft state without going into the edit form.

---

## 8. Implementation Steps

1. **API Client Helper:** Ensure the server-side API client wrapper appends the global auth `Bearer` token to the `headers: { Authorization: ...}` object during admin fetches.
2. **Setup Server Actions:** Create `app/actions/servicesActions.ts` and write the functions tying directly to `ADMIN_*` endpoints.
3. **Connect Public Pages:** Update `app/[local]/(routes)/services/page.tsx` and `[serviceSlug]/page.tsx` to handle the server fetch and handle empty/not-found states.
4. **Connect Admin Pages:** Update `app/[local]/dashboard/services/page.tsx` to populate a data table with drag-and-drop reordering.
5. **Implement Forms:** Finalize the Create/Update forms inside `app/[local]/dashboard/services/new/page.tsx` and `[serviceId]/page.tsx` using `useFormStatus`/`useActionState` and the Server Actions.

---

## 9. Key Business Rules

| Rule | Details |
|------|---------|
| **Auto-slug generation** | Slug is auto-generated from title on create (lowercased, trimmed, special chars removed) and regenerated on title update, guaranteed unique via numeric suffix |
| **Draft by default** | New services are always created as drafts (`isPublished: false`) with `order: 0` |
| **Title + shortDescription required to publish** | Cannot toggle to published without both fields |
| **Public list has no pagination** | `GET /services` returns all published services (sorted by `order ASC`) |
| **Admin list is paginated** | `GET /admin/services` supports pagination and sorting by `createdAt`, `updatedAt`, `title`, or `order` |
| **Atomic reordering** | Reorder uses a database transaction to ensure all-or-nothing updates |
| **Image cleanup** | Image purge is logged for deferred processing via Media module on deletion |
| **Admin-only access** | All `/admin/services` endpoints require `role: "admin"` via `@Roles()` decorator |
| **Rate limiting** | Public endpoints are throttled via `@nestjs/throttler` |
