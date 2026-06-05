# Portfolio Integration Plan

## 1. Overview

This document details the integration strategy for the Portfolio/Projects module between the Next.js frontend and the NestJS backend.

**Naming conventions:**

| Layer | Path Prefix |
|-------|------------|
| Public routes | `/portfolio` |
| Dashboard routes | `/dashboard/projects` |
| Backend endpoints (admin) | `/admin/portfolio` |
| Backend endpoints (public) | `/portfolio` |

All admin operations require a `Bearer` auth token in the request header.

**Data model — `Project` entity:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `title` | varchar(200) | Required |
| `slug` | varchar(220) | Auto-generated, unique |
| `shortDescription` | text | Required |
| `longDescription` | text | Optional |
| `coverImageUrl` | varchar(500) | Required to publish |
| `images` | text[] | Gallery URLs |
| `techStack` | text[] | Technology tags |
| `categoryId` | UUID | FK to categories |
| `category` | Category | Entity relation |
| `liveUrl` | varchar(500) | Optional |
| `repoUrl` | varchar(500) | Optional |
| `isPublished` | boolean | Default `false` |
| `isFeatured` | boolean | Default `false` |
| `order` | int | Display position, default `0` |
| `createdAt` | timestamp | Auto-set |
| `updatedAt` | timestamp | Auto-set |

---

## 2. Public Endpoints

### 2.1 `GET /portfolio`

**Purpose:** List all published projects with optional filtering.

**Controller:** `PortfolioPublicController.findPublished`

**Authentication:** None (public)

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categoryId` | UUID | No | Filter by category |
| `techStack` | string | No | Comma-separated tech names, e.g. `Next.js,TypeScript` |
| `featured` | boolean | No | `true` to return only featured projects |

**Query examples:**

```
GET /portfolio
GET /portfolio?featured=true
GET /portfolio?categoryId=abc-123&techStack=Next.js,React
```

**Response example (200):**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "E-Commerce Platform",
      "slug": "e-commerce-platform",
      "shortDescription": "A full-stack e-commerce solution with real-time inventory.",
      "longDescription": "Detailed description with architecture decisions...",
      "coverImageUrl": "https://cdn.example.com/covers/ecommerce.jpg",
      "images": [
        "https://cdn.example.com/gallery/ecom-1.jpg",
        "https://cdn.example.com/gallery/ecom-2.jpg"
      ],
      "techStack": ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
      "categoryId": "d4e5f6a7-b8c9-0123-defa-bc4567890123",
      "category": {
        "id": "d4e5f6a7-b8c9-0123-defa-bc4567890123",
        "name": "Web Applications"
      },
      "liveUrl": "https://example-store.com",
      "repoUrl": null,
      "isPublished": true,
      "isFeatured": true,
      "order": 1,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2026-01-15T14:30:00.000Z"
    }
  ]
}
```

---

### 2.2 `GET /portfolio/:slug`

**Purpose:** Get a single published project by its slug.

**Controller:** `PortfolioPublicController.findBySlug`

**Authentication:** None (public)

**Path parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Project slug, e.g. `e-commerce-platform` |

**Response example (200):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "E-Commerce Platform",
  "slug": "e-commerce-platform",
  "shortDescription": "A full-stack e-commerce solution with real-time inventory.",
  "longDescription": "Detailed description of the project...",
  "coverImageUrl": "https://cdn.example.com/covers/ecommerce.jpg",
  "images": [
    "https://cdn.example.com/gallery/ecom-1.jpg"
  ],
  "techStack": ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
  "categoryId": "d4e5f6a7-b8c9-0123-defa-bc4567890123",
  "category": {
    "id": "d4e5f6a7-b8c9-0123-defa-bc4567890123",
    "name": "Web Applications"
  },
  "liveUrl": "https://example-store.com",
  "repoUrl": "https://github.com/example/store",
  "isPublished": true,
  "isFeatured": true,
  "order": 1,
  "createdAt": "2025-12-01T10:00:00.000Z",
  "updatedAt": "2026-01-15T14:30:00.000Z"
}
```

**Error response (404):**

```json
{
  "statusCode": 404,
  "message": "Project with slug \"unknown-project\" not found",
  "error": "Not Found"
}
```

---

## 3. Admin Endpoints

### 3.1 `GET /admin/portfolio`

**Purpose:** List all projects (published + drafts) with pagination.

**Controller:** `PortfolioController.findAll`

**Authentication:** Required (ADMIN role)

**Query parameters (paginated):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max `100`) |
| `sortBy` | string | `createdAt` | One of: `createdAt`, `updatedAt`, `title` |
| `order` | string | `DESC` | `ASC` or `DESC` |

**Query example:**

```
GET /admin/portfolio?page=1&limit=10&sortBy=createdAt&order=DESC
```

**Response example (200):**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "E-Commerce Platform",
      "slug": "e-commerce-platform",
      "shortDescription": "A full-stack e-commerce solution.",
      "longDescription": null,
      "coverImageUrl": "https://cdn.example.com/covers/ecommerce.jpg",
      "images": [],
      "techStack": ["Next.js", "TypeScript"],
      "categoryId": null,
      "category": null,
      "liveUrl": null,
      "repoUrl": null,
      "isPublished": true,
      "isFeatured": false,
      "order": 1,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2026-01-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 3.2 `POST /admin/portfolio`

**Purpose:** Create a new project.

**Controller:** `PortfolioController.create`

**Authentication:** Required (ADMIN role)

**Request body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | Max 200 chars |
| `shortDescription` | string | Yes | — |
| `longDescription` | string | No | — |
| `coverImageUrl` | string | No | Max 500 chars |
| `images` | string[] | No | — |
| `techStack` | string[] | No | — |
| `categoryId` | UUID | No | Must exist |
| `liveUrl` | string | No | Max 500 chars |
| `repoUrl` | string | No | Max 500 chars |

**Request body example:**

```json
{
  "title": "Weather Dashboard",
  "shortDescription": "Real-time weather visualization app.",
  "longDescription": "Full project description with architecture details...",
  "coverImageUrl": "https://cdn.example.com/covers/weather.jpg",
  "images": ["https://cdn.example.com/gallery/weather-1.jpg"],
  "techStack": ["React", "TypeScript", "OpenWeather API"],
  "liveUrl": "https://weather-dashboard.example.com",
  "repoUrl": "https://github.com/example/weather"
}
```

**Response example (201):**

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "title": "Weather Dashboard",
  "slug": "weather-dashboard",
  "shortDescription": "Real-time weather visualization app.",
  "longDescription": "Full project description with architecture detail...",
  "coverImageUrl": "https://cdn.example.com/covers/weather.jpg",
  "images": ["https://cdn.example.com/gallery/weather-1.jpg"],
  "techStack": ["React", "TypeScript", "OpenWeather API"],
  "categoryId": null,
  "category": null,
  "liveUrl": "https://weather-dashboard.example.com",
  "repoUrl": "https://github.com/example/weather",
  "isPublished": false,
  "isFeatured": false,
  "order": 0,
  "createdAt": "2026-01-20T09:00:00.000Z",
  "updatedAt": "2026-01-20T09:00:00.000Z"
}
```

**Error response (400):**

```json
{
  "statusCode": 400,
  "message": [
    "title must not be empty",
    "title must not be longer than 200 characters"
  ],
  "error": "Bad Request"
}
```

---

### 3.3 `PATCH /admin/portfolio/:id`

**Purpose:** Update an existing project.

**Controller:** `PortfolioController.update`

**Authentication:** Required (ADMIN role)

**Path parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

**Request body:** Same fields as `POST`, all optional. Only provided fields are updated. Changing `title` auto-regenerates a unique `slug`.

**Request body example:**

```json
{
  "title": "Weather Dashboard v2",
  "techStack": ["Next.js", "TypeScript", "TailwindCSS", "OpenWeather API"]
}
```

**Response example (200):**

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "title": "Weather Dashboard v2",
  "slug": "weather-dashboard-v2",
  "shortDescription": "Real-time weather visualization app.",
  "longDescription": "Full project description with architecture detail...",
  "coverImageUrl": "https://cdn.example.com/covers/weather.jpg",
  "images": ["https://cdn.example.com/gallery/weather-1.jpg"],
  "techStack": ["Next.js", "TypeScript", "TailwindCSS", "OpenWeather API"],
  "categoryId": null,
  "category": null,
  "liveUrl": "https://weather-dashboard.example.com",
  "repoUrl": "https://github.com/example/weather",
  "isPublished": false,
  "isFeatured": false,
  "order": 0,
  "createdAt": "2026-01-20T09:00:00.000Z",
  "updatedAt": "2026-01-21T11:00:00.000Z"
}
```

**Error response (404):**

```json
{
  "statusCode": 404,
  "message": "Project with ID \"nonexistent-id\" not found",
  "error": "Not Found"
}
```

---

### 3.4 `DELETE /admin/portfolio/:id`

**Purpose:** Delete a project. Image URLs are logged for potential CDN purge.

**Controller:** `PortfolioController.remove`

**Authentication:** Required (ADMIN role)

**Response example (200):**

```json
{
  "message": "Project deleted successfully"
}
```

---

### 3.5 `PATCH /admin/portfolio/:id/publish`

**Purpose:** Toggle `isPublished` status. Requires `coverImageUrl` to publish.

**Controller:** `PortfolioController.togglePublish`

**Authentication:** Required (ADMIN role)

**Validation:** Cannot publish without a cover image.

**Response example (200):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "isPublished": true,
  "message": "Project published successfully"
}
```

**Response example (200) — unpublish:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "isPublished": false,
  "message": "Project unpublished successfully"
}
```

**Error response (400) — no cover image:**

```json
{
  "statusCode": 400,
  "message": "Cannot publish a project without a cover image",
  "error": "Bad Request"
}
```

---

### 3.6 `PATCH /admin/portfolio/:id/feature`

**Purpose:** Toggle `isFeatured` status. Maximum featured projects is configurable via `FEATURED_PROJECTS_MAX` env var (default: `6`).

**Controller:** `PortfolioController.toggleFeatured`

**Authentication:** Required (ADMIN role)

**Response example (200):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "isFeatured": true,
  "message": "Project featured successfully"
}
```

**Error response (400) — limit reached:**

```json
{
  "statusCode": 400,
  "message": "Maximum of 6 featured projects reached",
  "error": "Bad Request"
}
```

---

### 3.7 `PATCH /admin/portfolio/reorder`

**Purpose:** Batch reorder multiple projects in a single transaction.

**Controller:** `PortfolioController.reorder`

**Authentication:** Required (ADMIN role)

**Database:** Wrapped in a TypeORM transaction for atomicity.

**Request body:**

```json
{
  "items": [
    { "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "order": 0 },
    { "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "order": 1 },
    { "id": "c3d4e5f6-a7b8-9012-cdef-123456789012", "order": 2 }
  ]
}
```

**Response example (200):**

```json
{
  "message": "Projects reordered successfully"
}
```

---

## 4. Frontend Mapping

### Public Routes (`app/[local]/(routes)/portfolio`)

| File | Endpoint | Purpose |
|------|----------|---------|
| `portfolio/page.tsx` | `GET /portfolio` | Project grid with filters |
| `portfolio/[slug]/page.tsx` | `GET /portfolio/:slug` | Single project detail page |

### Dashboard Routes (`app/[local]/dashboard/projects`)

| File | Endpoint | Purpose |
|------|----------|---------|
| `projects/page.tsx` | `GET /admin/portfolio` | Project table (all items) |
| `projects/create/page.tsx` | `POST /admin/portfolio` | New project form |
| `projects/[id]/page.tsx` | `PATCH /admin/portfolio/:id` | Edit existing project |

### Server Actions (`app/actions/portfolioActions.ts`)

| Action | Endpoint | Side Effect |
|--------|----------|-------------|
| `createProject(formData)` | `POST /admin/portfolio` | `revalidateTag('portfolio')` |
| `updateProject(id, formData)` | `PATCH /admin/portfolio/:id` | `revalidateTag('portfolio')` |
| `deleteProject(id)` | `DELETE /admin/portfolio/:id` | `revalidateTag('portfolio')` |
| `togglePublishStatus(id)` | `PATCH /admin/portfolio/:id/publish` | `revalidateTag('portfolio')` |
| `toggleFeatureStatus(id)` | `PATCH /admin/portfolio/:id/feature` | `revalidateTag('portfolio')` |
| `reorderProjects(items)` | `PATCH /admin/portfolio/reorder` | `revalidateTag('portfolio')` |

---

## 5. Implementation Steps

1. **Create project form** — scaffold at `app/[local]/dashboard/projects/create/page.tsx`
2. **Server Actions** — implement mutations in `app/actions/portfolioActions.ts` with auth token forwarding
3. **Public grid page** — connect `portfolio/page.tsx` with `GET /portfolio`, add filter UI (category, tech stack, featured)
4. **Public detail page** — connect `portfolio/[slug]/page.tsx` with `GET /portfolio/:slug`
5. **Admin table** — enhance `projects/page.tsx` with publish/featured toggle buttons and reorder drag-and-drop
6. **Admin edit page** — preload data at `projects/[id]/page.tsx` via `GET /admin/portfolio` filtered by ID, submit via `PATCH`
7. **Cache revalidation** — all mutations must call `revalidateTag('portfolio')` to reflect changes on public pages immediately
