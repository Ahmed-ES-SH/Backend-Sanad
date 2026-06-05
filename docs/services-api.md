# Services API Documentation

> For frontend developers integrating with the Services module.

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

### Service Entity

| Field              | Type      | Required | Description                       |
| ------------------ | --------- | -------- | --------------------------------- |
| `id`               | `string`  | auto     | UUID, primary key                 |
| `title`            | `string`  | yes      | Max 150 chars                     |
| `slug`             | `string`  | auto     | Auto-generated from title, unique |
| `shortDescription` | `string`  | yes      | Brief service summary             |
| `longDescription`  | `string`  | no       | Detailed description              |
| `iconUrl`          | `string`  | no       | Icon image URL                    |
| `coverImageUrl`    | `string`  | no       | Cover image URL                   |
| `isPublished`      | `boolean` | auto     | Defaults to `false`               |
| `order`            | `number`  | auto     | Display order (0-based)           |
| `createdAt`        | `Date`    | auto     | Creation timestamp                |
| `updatedAt`        | `Date`    | auto     | Last update timestamp             |

---

## Public Endpoints

No authentication required. These endpoints return only **published** services.

### GET `/services`

List all published services sorted by display order.

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Web Development",
      "slug": "web-development",
      "shortDescription": "...",
      "longDescription": "...",
      "iconUrl": "https://...",
      "coverImageUrl": "https://...",
      "isPublished": true,
      "order": 0,
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ]
}
```

**Note:** No pagination — returns all published services.

---

### GET `/services/:slug`

Get a single published service by its slug.

**Path Parameters:**

| Parameter | Type     | Description       |
| --------- | -------- | ----------------- |
| `slug`    | `string` | SEO-friendly slug |

**Response:** Single `Service` object.

**Status Codes:**

- `200` — Service found
- `404` — Service not found or not published

---

## Admin Endpoints

All endpoints under `/admin/services` require **ADMIN** role authentication.

### GET `/admin/services`

List all services (including unpublished) with pagination.

**Query Parameters** (from `PaginationQueryDto`):

| Parameter | Type     | Default     | Description                                                      |
| --------- | -------- | ----------- | ---------------------------------------------------------------- |
| `page`    | `number` | `1`         | Page number (min: 1)                                             |
| `limit`   | `number` | `10`        | Items per page (1–100)                                           |
| `sortBy`  | `string` | `createdAt` | One of: `id`, `title`, `slug`, `order`, `createdAt`, `updatedAt` |
| `order`   | `string` | `DESC`      | `ASC` or `DESC`                                                  |

**Response:**

```json
{
  "data": [
    /* Service[] */
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

---

### POST `/admin/services`

Create a new service.

**Request Body** (`CreateServiceDto`):

| Field              | Type     | Required | Description          |
| ------------------ | -------- | -------- | -------------------- |
| `title`            | `string` | yes      | Max 150 chars        |
| `shortDescription` | `string` | yes      | Brief summary        |
| `longDescription`  | `string` | no       | Detailed description |
| `iconUrl`          | `string` | no       | Icon image URL       |
| `coverImageUrl`    | `string` | no       | Cover image URL      |

**Response:** Created `Service` object.  
**Status:** `201 Created`

---

### PATCH `/admin/services/:id`

Update an existing service.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Service UUID |

**Request Body** (`UpdateServiceDto`): All fields optional. Same shape as `CreateServiceDto` but every field is optional.

**Note:** If `title` is changed, the `slug` is auto-regenerated.

**Response:** Updated `Service` object.  
**Status:** `200 OK`

---

### DELETE `/admin/services/:id`

Delete a service.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Service UUID |

**Response:**

```json
{
  "message": "Service deleted successfully"
}
```

**Status:** `200 OK` or `404 Not Found`

---

### PATCH `/admin/services/:id/publish`

Toggle the publish status of a service.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Service UUID |

**Response:**

```json
{
  "id": "uuid",
  "isPublished": true,
  "message": "Service published successfully"
}
```

**Constraints:**

- Cannot publish without `title` and `shortDescription` → `400 Bad Request`

---

### PATCH `/admin/services/reorder`

Batch reorder services for display.

**Request Body** (`ReorderServicesDto`):

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
| `id`    | `string` | Service UUID                  |
| `order` | `number` | New position (integer, min 0) |

**Response:**

```json
{
  "message": "Services reordered successfully"
}
```

**Note:** This operation runs inside a database transaction.

---

## DTOs & Request Bodies

### CreateServiceDto

```typescript
interface CreateServiceDto {
  title: string; // required, max 150
  shortDescription: string; // required
  longDescription?: string; // optional
  iconUrl?: string; // optional
  coverImageUrl?: string; // optional
}
```

### UpdateServiceDto

Same as `CreateServiceDto` but all fields are optional.

### ReorderServicesDto

```typescript
interface ReorderServicesDto {
  items: {
    id: string; // UUID
    order: number; // integer >= 0
  }[];
}
```

---

## Error Responses

| Status | Description                                                         |
| ------ | ------------------------------------------------------------------- |
| `400`  | Bad Request — validation error, missing required fields for publish |
| `401`  | Unauthorized — missing or invalid token                             |
| `403`  | Forbidden — insufficient permissions                                |
| `404`  | Not Found — service does not exist                                  |

---

## Notes for Frontend

1. **Slug auto-generation:** The `slug` is automatically generated from the `title` on create. If you update the `title`, the `slug` is also regenerated. You do not need to send a `slug` in requests.

2. **Publishing requires title + shortDescription:** You cannot publish a service without both `title` and `shortDescription` set.

3. **Image URLs:** The API expects full URLs for `iconUrl` and `coverImageUrl`. These should come from your cloud storage service (uploaded separately).

4. **Ordering:** Services returned from the public endpoint are sorted by the `order` field (ascending). Use the `PATCH /admin/services/reorder` endpoint to control display order.

5. **No pagination on public endpoint:** The public `GET /services` endpoint returns all published services at once — no pagination parameters.
