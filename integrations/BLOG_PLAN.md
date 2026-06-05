# Blog Integration Plan

## 1. Overview

This plan specifies how the Blog module will connect the Next.js frontend with the NestJS backend. The integration includes an SEO-friendly public-facing blog and a protected dashboard for content administration. We will enforce Bearer Token authentication (as defined in the `AUTH_PLAN.md`) for all interactions within the admin boundaries. Only users with the `admin` role can access admin endpoints.

---

## 2. Data Models

### Article Entity

```typescript
interface Article {
  id: string;                 // UUID
  title: string;              // Max 300 chars
  slug: string;               // Auto-generated, unique URL-friendly identifier
  excerpt: string | null;     // Short summary (required before publishing)
  content: string;            // Full HTML/rich-text content
  coverImageUrl: string | null;
  tags: string[];             // Auto-lowercased, trimmed
  categoryId: string | null;  // FK to Category
  category: Category | null;  // Relation (joined on demand)
  isPublished: boolean;
  publishedAt: Date | null;
  readTimeMinutes: number;    // Auto-calculated (200 wpm)
  viewsCount: number;         // Increments on each public view
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

---

## 3. Backend API Endpoints

### 3.1 Public Endpoints (`/blog`)

These endpoints do not require authentication and are accessible to all visitors.

---

#### `GET /blog`

Fetches all published (published) blog articles with pagination, tag filtering, and category filtering.

**Query Parameters:**

| Parameter   | Type   | Required | Default     | Description                  |
|-------------|--------|----------|-------------|------------------------------|
| `page`      | number | No       | `1`         | Page number (min: 1)         |
| `limit`     | number | No       | `10`        | Items per page (min: 1, max: 100) |
| `sortBy`    | string | No       | `createdAt` | One of: `createdAt`, `updatedAt`, `amount`, `viewsCount`, `publishedAt`, `title` |
| `order`     | string | No       | `DESC`      | Sort order: `ASC` or `DESC`  |
| `categoryId`| string (UUID) | No | —       | Filter by category ID        |
| `tag`       | string | No       | —           | Filter by tag name           |

**Example Request:**
```
GET /blog?page=1&limit=5&tag=nestjs
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Getting Started with NestJS",
      "slug": "getting-started-with-nestjs",
      "excerpt": "A comprehensive guide to building scalable APIs with NestJS framework.",
      "coverImageUrl": "https://cdn.example.com/images/nestjs-guide.jpg",
      "tags": ["nestjs", "typescript", "backend"],
      "isPublished": true,
      "publishedAt": "2026-03-15T10:00:00.000Z",
      "readTimeMinutes": 8,
      "viewsCount": 342,
      "createdAt": "2026-03-10T08:30:00.000Z",
      "updatedAt": "2026-03-15T10:00:00.000Z",
      "category": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Backend Development",
        "slug": "backend-development"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 23,
    "totalPages": 5
  }
}
```

**Empty Response (200 OK):**
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": ["limit must not be greater than 100"], "error": "Bad Request"}` |

---

#### `GET /blog/:slug`

Fetches a single published article by its URL-friendly slug. Automatically increments the `viewsCount`.

**Path Parameters:**

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| `slug`    | string | Yes      | Article slug (e.g., `getting-started-with-nestjs`) |

**Example Request:**
```
GET /blog/getting-started-with-nestjs
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Getting Started with NestJS",
  "slug": "getting-started-with-nestjs",
  "excerpt": "A comprehensive guide to building scalable APIs with NestJS framework.",
  "content": "<h1>Introduction</h1><p>NestJS is a progressive Node.js framework...</p>",
  "coverImageUrl": "https://cdn.example.com/images/nestjs-guide.jpg",
  "tags": ["nestjs", "typescript", "backend"],
  "isPublished": true,
  "publishedAt": "2026-03-15T10:00:00.000Z",
  "readTimeMinutes": 8,
  "viewsCount": 343,
  "createdAt": "2026-03-10T08:30:00.000Z",
  "updatedAt": "2026-03-15T10:00:00.000Z",
  "category": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Backend Development",
    "slug": "backend-development"
  }
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `404 Not Found` | `{"statusCode": 404, "message": "Published article with slug \"wrong-slug\" not found", "error": "Not Found"}` |

---

### 3.2 Admin Endpoints (`/admin/blog`)

All endpoints require:
- **JWT Authentication** — `Authorization: Bearer <token>` header
- **Admin Role** — Only users with `role: "admin"` can access

---

#### `GET /admin/blog`

Lists all articles (including drafts) with pagination. Returns full article data.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**

| Parameter | Type   | Required | Default     | Description                  |
|-----------|--------|----------|-------------|------------------------------|
| `page`    | number | No       | `1`         | Page number (min: 1)         |
| `limit`   | number | No       | `10`        | Items per page (min: 1, max: 100) |
| `sortBy`  | string | No       | `createdAt` | One of: `createdAt`, `updatedAt`, `amount`, `viewsCount`, `publishedAt`, `title` |
| `order`   | string | No       | `DESC`      | Sort order: `ASC` or `DESC`  |

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Getting Started with NestJS",
      "slug": "getting-started-with-nestjs",
      "excerpt": "A comprehensive guide to building scalable APIs.",
      "content": "<h1>Introduction</h1><p>NestJS is a progressive...</p>",
      "coverImageUrl": "https://cdn.example.com/images/nestjs-guide.jpg",
      "tags": ["nestjs", "typescript", "backend"],
      "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "category": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Backend Development",
        "slug": "backend-development"
      },
      "isPublished": true,
      "publishedAt": "2026-03-15T10:00:00.000Z",
      "readTimeMinutes": 8,
      "viewsCount": 343,
      "createdAt": "2026-03-10T08:30:00.000Z",
      "updatedAt": "2026-03-15T10:00:00.000Z"
    },
    {
      "id": "660f9511-f3ac-52e5-b827-557766551111",
      "title": "Draft: Upcoming Features",
      "slug": "draft-upcoming-features",
      "excerpt": null,
      "content": "<p>Coming soon...</p>",
      "coverImageUrl": null,
      "tags": [],
      "categoryId": null,
      "category": null,
      "isPublished": false,
      "publishedAt": null,
      "readTimeMinutes": 1,
      "viewsCount": 0,
      "createdAt": "2026-04-01T12:00:00.000Z",
      "updatedAt": "2026-04-01T12:00:00.000Z"
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
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `POST /admin/blog`

Creates a new blog article. Articles are created as **drafts** by default (`isPublished: false`).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

| Field         | Type   | Required | Max Length | Description              |
|---------------|--------|----------|------------|--------------------------|
| `title`       | string | Yes      | 300        | Article title            |
| `content`     | string | Yes      | —          | Full HTML/rich-text content |
| `excerpt`     | string | No       | —          | Short summary            |
| `coverImageUrl`| string| No       | —          | Cover image URL          |
| `tags`        | string[]| No      | —          | Array of tag strings     |
| `categoryId`  | string (UUID) | No | —        | Category ID              |

**Example Request:**
```json
{
  "title": "Getting Started with NestJS",
  "content": "<h1>Introduction</h1><p>NestJS is a progressive Node.js framework...</p>",
  "excerpt": "A comprehensive guide to building scalable APIs with NestJS.",
  "coverImageUrl": "https://cdn.example.com/images/nestjs-guide.jpg",
  "tags": ["nestjs", "typescript", "backend"],
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Success Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Getting Started with NestJS",
  "slug": "getting-started-with-nestjs",
  "excerpt": "A comprehensive guide to building scalable APIs with NestJS.",
  "content": "<h1>Introduction</h1><p>NestJS is a progressive Node.js framework...</p>",
  "coverImageUrl": "https://cdn.example.com/images/nestjs-guide.jpg",
  "tags": ["nestjs", "typescript", "backend"],
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "category": null,
  "isPublished": false,
  "publishedAt": null,
  "readTimeMinutes": 8,
  "viewsCount": 0,
  "createdAt": "2026-04-07T14:30:00.000Z",
  "updatedAt": "2026-04-07T14:30:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": ["title must be shorter than 300 characters", "content should not be empty"], "error": "Bad Request"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `PATCH /admin/blog/:id`

Updates an existing article. Only provided fields are updated (partial update). If the title changes, the slug is auto-regenerated to remain unique. If content changes, `readTimeMinutes` is recalculated.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type | Required | Description    |
|-----------|------|----------|----------------|
| `id`      | string (UUID) | Yes | Article ID |

**Example Request:**
```json
{
  "title": "Updated: Getting Started with NestJS v2",
  "tags": ["nestjs", "typescript", "backend", "api"]
}
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated: Getting Started with NestJS v2",
  "slug": "updated-getting-started-with-nestjs-v2",
  "excerpt": "A comprehensive guide to building scalable APIs with NestJS.",
  "content": "<h1>Introduction</h1><p>NestJS is a progressive Node.js framework...</p>",
  "coverImageUrl": "https://cdn.example.com/images/nestjs-guide.jpg",
  "tags": ["nestjs", "typescript", "backend", "api"],
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "category": null,
  "isPublished": false,
  "publishedAt": null,
  "readTimeMinutes": 8,
  "viewsCount": 0,
  "createdAt": "2026-04-07T14:30:00.000Z",
  "updatedAt": "2026-04-07T15:45:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | Validation error |
| `404 Not Found` | `{"statusCode": 404, "message": "Article with ID \"invalid-uuid\" not found", "error": "Not Found"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `PATCH /admin/blog/:id/publish`

Toggles the publish status of an article. When publishing for the first time, `excerpt` is **required** and `publishedAt` is set. When unpublishing, `publishedAt` is preserved.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type | Required | Description    |
|-----------|------|----------|----------------|
| `id`      | string (UUID) | Yes | Article ID |

**Success Response — Publishing (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "isPublished": true,
  "publishedAt": "2026-04-07T16:00:00.000Z",
  "message": "Article published successfully"
}
```

**Success Response — Unpublishing (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "isPublished": false,
  "publishedAt": "2026-04-07T16:00:00.000Z",
  "message": "Article unpublished successfully"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "Excerpt is required before publishing an article", "error": "Bad Request"}` |
| `404 Not Found` | `{"statusCode": 404, "message": "Article with ID \"invalid-uuid\" not found", "error": "Not Found"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

#### `DELETE /admin/blog/:id`

Permanently deletes an article. If the article has a `coverImageUrl`, a CDN purge is triggered (logged for deferred processing).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type | Required | Description    |
|-----------|------|----------|----------------|
| `id`      | string (UUID) | Yes | Article ID |

**Success Response (200 OK):**
```json
{
  "message": "Article deleted successfully"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `404 Not Found` | `{"statusCode": 404, "message": "Article with ID \"invalid-uuid\" not found", "error": "Not Found"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |
| `403 Forbidden` | Valid token but user does not have `admin` role |

---

## 4. Server Components & Data Fetching

Next.js caching features will provide optimal performance and strict revalidation on content updates.

### Public Client Directory: `app/[local]/(routes)/blog`

- **`blog/page.tsx`** — Uses `GET /blog` to list blog cards. Tied to Next.js Cache tags (e.g., `next: { tags: ['blog'] }`).
- **`blog/[articleTitle]/page.tsx`** — Dynamically generates the individual blog post by fetching from `GET /blog/:slug`. Employs dynamic SEO headers based on the fetched data.

### Dashboard Admin Directory: `app/[local]/dashboard/blog`

- **`dashboard/blog/page.tsx`** — Uses `GET /admin/blog`. Renders the complete article inventory in a management table format. Requires the Authorization header.
- **`dashboard/blog/[articleId]/page.tsx`** — Uses `PATCH /admin/blog/:id` for updates. Server fetches corresponding article data and pre-populates the editor for modifications.

---

## 5. Creating the Add Article Page

A dedicated content creation page must be established in the dashboard.

- **Path:** `app/[local]/dashboard/blog/create/page.tsx`
- **Functionality:** This UI will feature a rich text editor (e.g., TipTap or Quill) for writing content alongside inputs for the article title, cover image, summary, tags, and SEO metadata.
- **Integration:** The form submission will trigger a Next.js Server Action invoking the `POST /admin/blog` endpoint.

---

## 6. Server Actions (Mutations)

To safely run backend modifications without exposing the token, all dashboard changes will use a dedicated action file: `app/actions/blogActions.ts`.

**Planned Actions:**

| Action | Backend Endpoint | Description |
|--------|-----------------|-------------|
| `createArticle(formData)` | `POST /admin/blog` | Creates a new draft article |
| `updateArticle(id, formData)` | `PATCH /admin/blog/:id` | Updates an existing article. Triggers cache invalidation on success. |
| `deleteArticle(id)` | `DELETE /admin/blog/:id` | Permanently deletes an article |
| `togglePublishStatus(id)` | `PATCH /admin/blog/:id/publish` | Toggles published status. Triggers cache invalidation on success. |

All mutations making physical data state changes will run `revalidateTag('blog')` on success to update the public-facing interface without requiring an explicit deployment.

---

## 7. Implementation Steps

1. **Develop the Rich Text Creation UI:** Build the form and editor interface within `dashboard/blog/create/page.tsx`.
2. **Build Server Actions:** Initialize `app/actions/blogActions.ts` passing data and injecting the Auth Bearer token to NestJS.
3. **Public Article View (`[slug]`):** Map the data correctly to markdown/HTML output and apply safe-HTML rendering (`dangerouslySetInnerHTML` or a library like `DOMPurify` depending on API response formatting).
4. **Connect the Dashboard Table View:** Map data to the `dashboard/blog/page.tsx` view and connect "Publish" toggle buttons to `togglePublishStatus(id)`.

---

## 8. Key Business Rules

| Rule | Details |
|------|---------|
| **Auto-slug generation** | Slug is auto-generated from title on create and regenerated on title update, guaranteed unique |
| **Read time calculation** | Strips HTML tags, counts words at 200 wpm, minimum 1 minute |
| **Draft by default** | New articles are always created as drafts (`isPublished: false`) |
| **Excerpt required to publish** | Cannot toggle to published without an excerpt |
| **PublishedAt preservation** | `publishedAt` is set on first publish and preserved on unpublish |
| **View counter** | `viewsCount` auto-increments on each `GET /blog/:slug` call |
| **Tag normalization** | Tags are auto-trimmed and lowercased before saving |
| **Cover image cleanup** | CDN purge is triggered (logged) on article deletion |
| **Admin-only access** | All `/admin/blog` endpoints require `role: "admin"` via `@Roles()` decorator |
