# Categories Integration Plan

## 1. Overview

The Categories module provides CRUD operations for categorizing content across the Sanad platform. Categories are used to organize Projects, Services, and Articles. The module exposes two sets of endpoints: **public endpoints** for general users (read-only) and **admin endpoints** requiring authentication and admin role for full CRUD operations.

---

## 2. Backend API Endpoints

### 2.1 Public Endpoints (`/categories`)

Public endpoints require no authentication and are accessible to all users.

---

#### `GET /categories`

Retrieves all categories for public display. No pagination - returns all categories sorted by `order` ASC, then `name` ASC.

**Query Parameters:** None required.

**Success Response (200 OK):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Web Development",
    "slug": "web-development",
    "description": "Web development services and projects",
    "color": "#FF5733",
    "icon": "code",
    "order": 1,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-04-01T08:15:00.000Z"
  },
  {
    "id": "b2c3d4e5-f678-90ab-cdef-123456789012",
    "name": "Mobile Apps",
    "slug": "mobile-apps",
    "description": "Mobile application development",
    "color": "#3498DB",
    "icon": "smartphone",
    "order": 2,
    "createdAt": "2026-01-16T10:30:00.000Z",
    "updatedAt": "2026-04-02T08:15:00.000Z"
  }
]
```

**Error Responses:**
| Status | Body |
|--------|------|
| 500 Internal Server Error | Database or server error |

---

#### `GET /categories/:slug`

Retrieves a single category by its slug (friendly URL identifier).

**Path Parameters:**
| Parameter | Type   | Required | Description          |
|-----------|--------|----------|---------------------|
| `slug`    | string | Yes      | Category slug       |

**Success Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Web Development",
  "slug": "web-development",
  "description": "Web development services and projects",
  "color": "#FF5733",
  "icon": "code",
  "order": 1,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-04-01T08:15:00.000Z"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| 404 Not Found | `{"statusCode": 404, "message": "Category not found", "error": "Not Found"}` |

---

### 2.2 Protected Endpoints (`/admin/categories`)

Admin endpoints require a valid JWT token with ADMIN role. Access denied for regular users.

---

#### `POST /admin/categories`

Creates a new category. Automatically generates a URL-friendly slug from the name if not provided.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "UI/UX Design",
  "slug": "ui-ux-design",
  "description": "User interface and experience design services",
  "color": "#9B59B6",
  "icon": "palette",
  "order": 3
}
```

**Field Details:**
| Field       | Type   | Required | Constraints / Description |
|-------------|--------|----------|---------------------------|
| `name`      | string | Yes     | Max 100 characters         |
| `slug`      | string | No      | Auto-generated if omitted. Must be lowercase alphanumeric with hyphens only |
| `description` | string | No    | No limit                  |
| `color`     | string | No      | Hex color code (e.g., #FF5733) |
| `icon`      | string | No      | Max 50 characters        |
| `order`     | number | No      | Integer >= 0, display order |

**Success Response (201 Created):**
```json
{
  "id": "c3d4e5f6-7890-abcd-ef1234567890",
  "name": "UI/UX Design",
  "slug": "ui-ux-design",
  "description": "User interface and experience design services",
  "color": "#9B59B6",
  "icon": "palette",
  "order": 3,
  "createdAt": "2026-01-17T10:30:00.000Z",
  "updatedAt": "2026-01-17T10:30:00.000Z"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| 401 Unauthorized | Invalid or missing JWT token |
| 403 Forbidden | User does not have admin role |
| 409 Conflict | `{"statusCode": 409, "message": "Category with this name/slug already exists", "error": "Conflict"}` |
| 400 Bad Request | Validation error |

---

#### `GET /admin/categories`

Retrieves all categories with pagination and optional filtering.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
| Parameter | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| `page`    | number | No       | 1       | Page number (>= 1) |
| `limit`   | number | No       | 10      | Items per page (>= 1) |
| `search`  | string | No       | -       | Search by name (case-insensitive) |
| `sortBy`   | string | No       | order   | Sort field: `name`, `order`, `createdAt` |
| `sortOrder`| string | No       | ASC     | Sort direction: `ASC`, `DESC` |

**Example Request:**
```
GET /admin/categories?page=1&limit=10&search=web&sortBy=name&sortOrder=ASC
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Web Development",
      "slug": "web-development",
      "description": "Web development services and projects",
      "color": "#FF5733",
      "icon": "code",
      "order": 1,
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-04-01T08:15:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "lastPage": 1,
    "perPage": 10
  }
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| 401 Unauthorized | Invalid or missing JWT token |

---

#### `GET /admin/categories/:id`

Retrieves a single category by its UUID.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | UUID   | Yes      | Category UUID |

**Success Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Web Development",
  "slug": "web-development",
  "description": "Web development services and projects",
  "color": "#FF5733",
  "icon": "code",
  "order": 1,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-04-01T08:15:00.000Z"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| 401 Unauthorized | Invalid or missing JWT token |
| 404 Not Found | Category not found |

---

#### `PATCH /admin/categories/:id`

Partially updates a category. Only provided fields are updated.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | UUID   | Yes      | Category UUID |

**Request Body:**
```json
{
  "name": "Web Development Updated",
  "color": "#E74C3C"
}
```

**Success Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Web Development Updated",
  "slug": "web-development",
  "description": "Web development services and projects",
  "color": "#E74C3C",
  "icon": "code",
  "order": 1,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-05-06T12:00:00.000Z"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| 401 Unauthorized | Invalid or missing JWT token |
| 403 Forbidden | User does not have admin role |
| 404 Not Found | Category not found |
| 409 Conflict | Category name/slug already exists |

---

#### `DELETE /admin/categories/:id`

Deletes a category. Deletion is only allowed if category is not in use by any Project, Service, or Article. If in use, the category is still deleted but the backend will nullify the `categoryId` on related entities.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | UUID   | Yes      | Category UUID |

**Success Response (200 OK):**
```json
{
  "message": "Category deleted successfully"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| 401 Unauthorized | Invalid or missing JWT token |
| 404 Not Found | Category not found |

---

#### `POST /admin/categories/reorder`

Bulk reorder categories by providing an array of category IDs with new order values.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "categories": [
    { "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "order": 2 },
    { "id": "b2c3d4e5-f678-90ab-cdef-123456789012", "order": 1 },
    { "id": "c3d4e5f6-7890-abcd-ef1234567890", "order": 3 }
  ]
}
```

**Success Response (200 OK):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Web Development",
    "slug": "web-development",
    "order": 2,
    ...
  },
  {
    "id": "b2c3d4e5-f678-90ab-cdef-123456789012",
    "name": "Mobile Apps",
    "slug": "mobile-apps",
    "order": 1,
    ...
  },
  {
    "id": "c3d4e5f6-7890-abcd-ef1234567890",
    "name": "UI/UX Design",
    "slug": "ui-ux-design",
    "order": 3,
    ...
  }
]
```

**Error Responses:**
| Status | Body |
|--------|------|
| 401 Unauthorized | Invalid or missing JWT token |
| 400 Bad Request | Invalid request body format |

---

## 3. Data Models

### Category Entity
```typescript
interface Category {
  id: string;                    // UUID
  name: string;                // Required, max 100 chars
  slug: string;               // Unique, lowercase alphanumeric with hyphens
  description: string | null; // Optional
  color: string | null;       // Hex color code (#RRGGBB)
  icon: string | null;        // Optional icon name
  order: number;             // Display order (integer >= 0)
  createdAt: Date;
  updatedAt: Date;
}
```

### Category with Usage Counts (Admin only)
```typescript
interface CategoryWithCounts extends Category {
  projectsCount: number;  // Number of projects in this category
  servicesCount: number;  // Number of services in this category
  articlesCount: number; // Number of articles in this category
}
```

### Pagination Meta
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

## 4. Integration Patterns

### 4.1 BFF Pattern (Recommended for Protected Endpoints)

For admin operations requiring authentication:

1. **Next.js Server Actions / API Routes:** Create server-side handlers in Next.js that call the backend API.
2. **Token Injection:** Extract the JWT from cookies and inject into the `Authorization: Bearer` header.
3. **Response Handling:** Return processed data to the client.

**Example Server Action:**
```typescript
// app/actions/categoryActions.ts
'use server'

import { cookies } from 'next/headers'

export async function createCategory(data: CreateCategoryDto) {
  const token = cookies().get('access_token')?.value
  
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  
  return response.json()
}
```

### 4.2 Direct API Calls (Public Endpoints Only)

For public category retrieval, Next.js can directly fetch from the public API:

```typescript
// lib/api/categories.ts
export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    next: { revalidate: 60 } // Cache for 60 seconds
  })
  return response.json()
}

export async function getCategoryBySlug(slug: string) {
  const response = await fetch(`${API_BASE_URL}/categories/${slug}`)
  return response.json()
}
```

---

## 5. Required Frontend Contexts & Hooks

### 5.1 Category Context (Optional)

For global category state management in admin dashboards:

```typescript
// app/context/CategoryContext.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'

interface CategoryContextType {
  categories: Category[]
  refreshCategories: () => Promise<void>
  isLoading: boolean
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)
```

### 5.2 Custom Hooks

```typescript
// app/hooks/useCategories.ts
'use client'

export function useCategories() {
  // Fetch public categories with caching
  // Use SWR or React Query for client-side data management
}

export function useAdminCategories() {
  // Fetch admin categories with pagination/filters
  // Requires authenticated user
}
```

---

## 6. Required Pages & Screens

### 6.1 Public Pages

| Page | Description |
|------|-------------|
| `/categories` | Grid/list view of all categories with icons and colors |
| `/categories/[slug]` | Single category detail page |

### 6.2 Admin Pages (Requires Admin Role)

| Page | Description |
|------|-------------|
| `/admin/categories` | Categories management table with search, pagination, sort |
| `/admin/categories/new` | Create category form |
| `/admin/categories/[id]/edit` | Edit category form |
| `/admin/categories/reorder` | Drag-and-drop category reorder interface |

### 6.3 Components

| Component | Description |
|-----------|-------------|
| `CategoryCard` | Public category display card with color/icon |
| `CategorySelect` | Dropdown/select component for picking categories |
| `CategoryTable` | Admin table with sorting, filtering,_actions |
| `CategoryForm` | Create/Edit category form |
| `ReorderList` | Drag-and-drop reorder list |

---

## 7. Step-by-Step Implementation Outline

### Phase 1: Public Integration
1. **Create API Client:** Implement `lib/api/categories.ts` with `getCategories()` and `getCategoryBySlug()`.
2. **Build Category Page:** Create `/categories/page.tsx` displaying all categories.
3. **Build Category Detail:** Create `/categories/[slug]/page.tsx` for single category view.
4. **Add Category Select:** Create reusable `CategorySelect` component for use in other forms.

### Phase 2: Admin Integration
1. **Admin API Client:** Extend API client with admin endpoints (`createCategory`, `updateCategory`, `deleteCategory`, etc.).
2. **Admin Server Actions:** Create `app/actions/categoryActions.ts` for protected operations.
3. **Category Management Table:** Build `/admin/categories/page.tsx` with CRUD operations.
4. **Category Forms:** Create category create/edit forms (`/admin/categories/new`, `/admin/categories/[id]/edit`).
5. **Reorder Interface:** Implement drag-and-drop reorder UI.

### Phase 3: Polish & UX
1. **Loading States:** Add skeleton loaders for category lists.
2. **Error Handling:** Display toast notifications for success/error.
3. **Optimistic Updates:** Implement optimistic UI for reorder operations.
4. **Caching:** Add client-side caching with React Query or SWR.

---

## 8. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Category slug already exists | Show validation error, suggest alternative slug |
| Delete category in use | Allow deletion (cascade nullify), show warning/confirmation |
| Empty categories list | Display empty state with "Create your first category" CTA |
| Category not found | Show 404 page with "Back to categories" link |
| Unauthorized access | Redirect to login or show access denied |

---

## 9. Security Considerations

| Feature | Details |
|---------|---------|
| **Admin Protection** | All `/admin/categories` endpoints require JWT + Admin role |
| **Slug Validation** | Must match `/^[a-z0-9-]+$/` (lowercase, numbers, hyphens only) |
| **Color Validation** | Must be valid hex color code |
| **Input Sanitization** | Slugs auto-generated to prevent XSS |
| **Rate Limiting** | Admin endpoints protected by NestJS rate limiter |

---

## 10. API Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3001` |
| Production | `https://api.sanad.example.com` |

---

## 11. Related Modules

The Categories module has relations to:
- **Projects** — Categories can be assigned to projects
- **Services** — Categories can be assigned to services
- **Articles** — Categories can be assigned to blog articles

When deleting a category, the backend automatically nullifies `categoryId` on related entities.