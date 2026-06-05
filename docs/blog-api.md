# Blog API Documentation

> For frontend developers integrating with the Blog module.

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

### Article Entity

| Field             | Type       | Required | Description                         |
| ----------------- | ---------- | -------- | ----------------------------------- |
| `id`              | `string`   | auto     | UUID, primary key                   |
| `title`           | `string`   | yes      | Max 300 chars                       |
| `slug`            | `string`   | auto     | Auto-generated from title, unique   |
| `excerpt`         | `string`   | no       | Short summary (required to publish) |
| `content`         | `string`   | yes      | Full article content (HTML allowed) |
| `coverImageUrl`   | `string`   | no       | Cover image URL                     |
| `tags`            | `string[]` | no       | Auto-lowercased, trimmed            |
| `isPublished`     | `boolean`  | auto     | Defaults to `false`                 |
| `publishedAt`     | `Date`     | auto     | Set on first publish                |
| `readTimeMinutes` | `number`   | auto     | Calculated from content (200 wpm)   |
| `viewsCount`      | `number`   | auto     | Increments on each public view      |
| `createdAt`       | `Date`     | auto     | Creation timestamp                  |
| `updatedAt`       | `Date`     | auto     | Last update timestamp               |

---

## Public Endpoints

No authentication required. These endpoints return only **published** articles.

### GET `/blog`

List published articles with pagination and optional tag filtering.

**Query Parameters:**

| Parameter | Type     | Default     | Description                      |
| --------- | -------- | ----------- | -------------------------------- |
| `page`    | `number` | `1`         | Page number (min: 1)             |
| `limit`   | `number` | `10`        | Items per page (1–100)           |
| `sortBy`  | `string` | `createdAt` | Sort field                       |
| `order`   | `string` | `DESC`      | `ASC` or `DESC`                  |
| `tag`     | `string` | —           | Filter by tag (case-insensitive) |

**Note:** Public articles are always sorted by `publishedAt` descending regardless of sort params.

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Article Title",
      "slug": "article-title",
      "excerpt": "...",
      "coverImageUrl": "https://...",
      "tags": ["typescript", "nestjs"],
      "isPublished": true,
      "publishedAt": "2026-04-01T00:00:00.000Z",
      "readTimeMinutes": 5,
      "viewsCount": 42,
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Note:** The public list endpoint returns a **partial** article — `content` is excluded. Use `GET /blog/:slug` to get the full article.

**Example:**

```
GET /blog?tag=nestjs&page=1&limit=5
```

---

### GET `/blog/:slug`

Get a single published article by its slug. Returns the **full** article including `content`.

**Path Parameters:**

| Parameter | Type     | Description       |
| --------- | -------- | ----------------- |
| `slug`    | `string` | SEO-friendly slug |

**Response:** Full `Article` object (includes `content`).

**Side Effect:** Each call increments `viewsCount` by 1.

**Status Codes:**

- `200` — Article found
- `404` — Article not found or not published

---

## Admin Endpoints

All endpoints under `/admin/blog` require **ADMIN** role authentication.

### GET `/admin/blog`

List all articles (including unpublished) with pagination.

**Query Parameters** (from `PaginationQueryDto`):

| Parameter | Type     | Default     | Description            |
| --------- | -------- | ----------- | ---------------------- |
| `page`    | `number` | `1`         | Page number (min: 1)   |
| `limit`   | `number` | `10`        | Items per page (1–100) |
| `sortBy`  | `string` | `createdAt` | Sort field             |
| `order`   | `string` | `DESC`      | `ASC` or `DESC`        |

**Response:**

```json
{
  "data": [
    /* Article[] — full objects including content */
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### POST `/admin/blog`

Create a new article.

**Request Body** (`CreateArticleDto`):

| Field           | Type       | Required | Description                  |
| --------------- | ---------- | -------- | ---------------------------- |
| `title`         | `string`   | yes      | Max 300 chars                |
| `content`       | `string`   | yes      | Full article content (HTML)  |
| `excerpt`       | `string`   | no       | Short summary                |
| `coverImageUrl` | `string`   | no       | Must be a valid URL          |
| `tags`          | `string[]` | no       | Auto-normalized to lowercase |

**Response:** Created `Article` object.  
**Status:** `201 Created`

---

### PATCH `/admin/blog/:id`

Update an existing article.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Article UUID |

**Request Body** (`UpdateArticleDto`): All fields optional. Same shape as `CreateArticleDto` but every field is optional.

**Note:** If `title` is changed, the `slug` is auto-regenerated. If `content` is changed, `readTimeMinutes` is recalculated.

**Response:** Updated `Article` object.  
**Status:** `200 OK`

---

### DELETE `/admin/blog/:id`

Delete an article.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Article UUID |

**Response:**

```json
{
  "message": "Article deleted successfully"
}
```

**Status:** `200 OK` or `404 Not Found`

---

### PATCH `/admin/blog/:id/publish`

Toggle the publish status of an article.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Article UUID |

**Response:**

```json
{
  "id": "uuid",
  "isPublished": true,
  "publishedAt": "2026-04-01T00:00:00.000Z",
  "message": "Article published successfully"
}
```

**Constraints:**

- Cannot publish without an `excerpt` → `400 Bad Request`
- On first publish, `publishedAt` is set. Unpublishing and republishing does NOT change `publishedAt`.

---

## DTOs & Request Bodies

### CreateArticleDto

```typescript
interface CreateArticleDto {
  title: string; // required, max 300
  content: string; // required, HTML allowed
  excerpt?: string; // optional, required to publish
  coverImageUrl?: string; // optional, must be valid URL
  tags?: string[]; // optional, auto-lowercased
}
```

### UpdateArticleDto

Same as `CreateArticleDto` but all fields are optional.

### FilterArticlesQueryDto

```typescript
interface FilterArticlesQueryDto {
  tag?: string; // case-insensitive tag filter
}
```

---

## Error Responses

| Status | Description                                                  |
| ------ | ------------------------------------------------------------ |
| `400`  | Bad Request — validation error, excerpt required for publish |
| `401`  | Unauthorized — missing or invalid token                      |
| `403`  | Forbidden — insufficient permissions                         |
| `404`  | Not Found — article does not exist                           |

---

## Notes for Frontend

1. **Slug auto-generation:** The `slug` is automatically generated from the `title` on create. If you update the `title`, the `slug` is also regenerated. You do not need to send a `slug` in requests.

2. **Excerpt required for publishing:** You cannot publish an article without setting `excerpt` first.

3. **Read time auto-calculated:** `readTimeMinutes` is calculated from `content` at 200 words per minute. HTML tags are stripped before counting. Updating `content` recalculates this value.

4. **Tags are normalized:** All tags are automatically trimmed and lowercased on save. `[" TypeScript ", "NESTJS"]` becomes `["typescript", "nestjs"]`.

5. **Views count:** Each call to `GET /blog/:slug` increments `viewsCount` by 1. The public list endpoint does NOT increment views.

6. **Partial response on list:** The public `GET /blog` endpoint excludes `content` from the response to reduce payload size. Fetch individual articles via `GET /blog/:slug` for full content.

7. **Sorting on public list:** Public articles are always sorted by `publishedAt` descending, regardless of `sortBy`/`order` query params.

8. **Image URLs:** The API expects a valid URL for `coverImageUrl`. This should come from your cloud storage service (uploaded separately).
