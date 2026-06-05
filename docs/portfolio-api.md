# Portfolio API Documentation

> For frontend developers integrating with the Portfolio module.

**Base URL:** `/api` (adjust based on your environment)  
**Authentication:** Admin endpoints require `Bearer` token with `ADMIN` role.

---

## Table of Contents

- [Data Model](#data-model)
- [Public Endpoints](#public-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [DTOs & Request Bodies](#dtos--request-bodies)
- [Error Responses](#error-responses)
- [Notes for Frontend](#notes-for-frontend)

---

## Data Model

### Project Entity

| Field              | Type       | Required | Description                           |
| ------------------ | ---------- | -------- | ------------------------------------- |
| `id`               | `string`   | auto     | UUID, primary key                     |
| `title`            | `string`   | yes      | Max 200 chars                         |
| `slug`             | `string`   | auto     | Auto-generated from title, unique     |
| `shortDescription` | `string`   | yes      | Brief project summary                 |
| `longDescription`  | `string`   | no       | Detailed description                  |
| `coverImageUrl`    | `string`   | no       | Cover image URL (required to publish) |
| `images`           | `string[]` | no       | Gallery image URLs                    |
| `techStack`        | `string[]` | no       | Technologies used                     |
| `category`         | `string`   | no       | Max 100 chars (e.g. "Web App")        |
| `liveUrl`          | `string`   | no       | Live project URL                      |
| `repoUrl`          | `string`   | no       | Source code repository URL            |
| `isPublished`      | `boolean`  | auto     | Defaults to `false`                   |
| `isFeatured`       | `boolean`  | auto     | Defaults to `false`                   |
| `order`            | `number`   | auto     | Display order (0-based)               |
| `createdAt`        | `Date`     | auto     | Creation timestamp                    |
| `updatedAt`        | `Date`     | auto     | Last update timestamp                 |

---

## Public Endpoints

No authentication required. These endpoints return only **published** projects.

### GET `/portfolio`

List all published projects with optional filters.

**Query Parameters:**

| Parameter   | Type       | Description                                      |
| ----------- | ---------- | ------------------------------------------------ |
| `category`  | `string`   | Filter by category (case-insensitive)            |
| `techStack` | `string[]` | Comma-separated tech tags (e.g. `React,Node.js`) |
| `featured`  | `boolean`  | Filter featured only (`true`/`false`)            |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Project Name",
      "slug": "project-name",
      "shortDescription": "...",
      "longDescription": "...",
      "coverImageUrl": "https://...",
      "images": ["https://...", "..."],
      "techStack": ["React", "Node.js"],
      "category": "Web App",
      "liveUrl": "https://...",
      "repoUrl": "https://...",
      "isPublished": true,
      "isFeatured": false,
      "order": 0,
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ]
}
```

**Example:**

```
GET /portfolio?category=Web%20App&techStack=React,TypeScript&featured=true
```

---

### GET `/portfolio/:slug`

Get a single published project by its slug.

**Path Parameters:**

| Parameter | Type     | Description       |
| --------- | -------- | ----------------- |
| `slug`    | `string` | SEO-friendly slug |

**Response:** Single `Project` object.

**Status Codes:**

- `200` — Project found
- `404` — Project not found or not published

---

## Admin Endpoints

All endpoints under `/admin/portfolio` require **ADMIN** role authentication.

### GET `/admin/portfolio`

List all projects (including unpublished) with pagination.

**Query Parameters** (from `PaginationQueryDto`):

| Parameter | Type     | Default     | Description                               |
| --------- | -------- | ----------- | ----------------------------------------- |
| `page`    | `number` | `1`         | Page number (min: 1)                      |
| `limit`   | `number` | `10`        | Items per page (1–100)                    |
| `sortBy`  | `string` | `createdAt` | One of: `createdAt`, `updatedAt`, `title` |
| `order`   | `string` | `DESC`      | `ASC` or `DESC`                           |

**Response:**

```json
{
  "data": [
    /* Project[] */
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### POST `/admin/portfolio`

Create a new project.

**Request Body** (`CreateProjectDto`):

| Field              | Type       | Required | Description          |
| ------------------ | ---------- | -------- | -------------------- |
| `title`            | `string`   | yes      | Max 200 chars        |
| `shortDescription` | `string`   | yes      | Brief summary        |
| `longDescription`  | `string`   | no       | Detailed description |
| `coverImageUrl`    | `string`   | no       | Cover image URL      |
| `images`           | `string[]` | no       | Gallery URLs         |
| `techStack`        | `string[]` | no       | Tech tags            |
| `category`         | `string`   | no       | Max 100 chars        |
| `liveUrl`          | `string`   | no       | Live project URL     |
| `repoUrl`          | `string`   | no       | Repo URL             |

**Response:** Created `Project` object.  
**Status:** `201 Created`

---

### PATCH `/admin/portfolio/:id`

Update an existing project.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Project UUID |

**Request Body** (`UpdateProjectDto`): All fields optional. Same shape as `CreateProjectDto` but every field is optional. Only send the fields you want to update.

**Note:** If `title` is changed, the `slug` is auto-regenerated.

**Response:** Updated `Project` object.  
**Status:** `200 OK`

---

### DELETE `/admin/portfolio/:id`

Delete a project.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Project UUID |

**Response:**

```json
{
  "message": "Project deleted successfully"
}
```

**Status:** `200 OK` or `404 Not Found`

---

### PATCH `/admin/portfolio/:id/publish`

Toggle the publish status of a project.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Project UUID |

**Response:**

```json
{
  "id": "uuid",
  "isPublished": true,
  "message": "Project published successfully"
}
```

**Constraints:**

- Cannot publish without a `coverImageUrl` → `400 Bad Request`

---

### PATCH `/admin/portfolio/:id/feature`

Toggle the featured status of a project.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Project UUID |

**Response:**

```json
{
  "id": "uuid",
  "isFeatured": true,
  "message": "Project featured successfully"
}
```

**Constraints:**

- Maximum featured projects is configurable (default: `6`) → `400 Bad Request` if limit reached

---

### PATCH `/admin/portfolio/reorder`

Batch reorder projects for display.

**Request Body** (`ReorderProjectsDto`):

```json
{
  "items": [
    { "id": "uuid-1", "order": 0 },
    { "id": "uuid-2", "order": 1 },
    { "id": "uuid-3", "order": 2 }
  ]
}
```

| Field   | Type     | Description                   |
| ------- | -------- | ----------------------------- |
| `id`    | `string` | Project UUID                  |
| `order` | `number` | New position (integer, min 0) |

**Response:**

```json
{
  "message": "Projects reordered successfully"
}
```

**Note:** This operation runs inside a database transaction.

---

## DTOs & Request Bodies

### CreateProjectDto

```typescript
interface CreateProjectDto {
  title: string; // required, max 200
  shortDescription: string; // required
  longDescription?: string; // optional
  coverImageUrl?: string; // optional
  images?: string[]; // optional
  techStack?: string[]; // optional
  category?: string; // optional, max 100
  liveUrl?: string; // optional
  repoUrl?: string; // optional
}
```

### UpdateProjectDto

Same as `CreateProjectDto` but all fields are optional.

### ReorderProjectsDto

```typescript
interface ReorderProjectsDto {
  items: {
    id: string; // UUID
    order: number; // integer >= 0
  }[];
}
```

### FilterProjectsQueryDto (Public)

```typescript
interface FilterProjectsQueryDto {
  category?: string; // case-insensitive match
  techStack?: string[]; // comma-separated in query string
  featured?: boolean; // "true" or "false"
}
```

### PaginationQueryDto (Admin)

```typescript
interface PaginationQueryDto {
  page?: number; // default: 1, min: 1
  limit?: number; // default: 10, min: 1, max: 100
  sortBy?: string; // default: "createdAt"
  order?: string; // "ASC" | "DESC", default: "DESC"
}
```

---

## Error Responses

| Status | Description                                                                 |
| ------ | --------------------------------------------------------------------------- |
| `400`  | Bad Request — validation error, missing cover image, featured limit reached |
| `401`  | Unauthorized — missing or invalid token                                     |
| `403`  | Forbidden — insufficient permissions                                        |
| `404`  | Not Found — project does not exist                                          |

---

## Notes for Frontend

1. **Slug auto-generation:** The `slug` is automatically generated from the `title` on create. If you update the `title`, the `slug` is also regenerated. You do not need to send a `slug` in requests.

2. **Publishing requires cover image:** You cannot publish a project without setting `coverImageUrl` first.

3. **Featured limit:** There is a configurable maximum for featured projects (default: 6). The API will return `400` if you try to feature more.

4. **Tech stack filtering:** When filtering by `techStack` on the public endpoint, pass as comma-separated values:

   ```
   GET /portfolio?techStack=React,TypeScript,Node.js
   ```

5. **Ordering:** Projects returned from the public endpoint are sorted by the `order` field (ascending). Use the `PATCH /admin/portfolio/reorder` endpoint to control display order.

6. **Image URLs:** The API expects full URLs for `coverImageUrl` and `images[]`. These should come from your cloud storage service (uploaded separately). On delete, the backend logs URLs for potential CDN purge.

7. **Arrays default to empty:** If you don't provide `images` or `techStack`, they default to empty arrays `[]`.
