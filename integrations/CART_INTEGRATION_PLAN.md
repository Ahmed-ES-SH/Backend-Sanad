# 🛒 Cart API — Frontend Integration Plan

> **Base URL:** `http://localhost:3001/api`  
> **Tag:** `Cart`  
> **Auth:** All endpoints require a valid JWT Bearer token.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Data Models](#data-models)
4. [Endpoints](#endpoints)
   - [GET /cart](#1-get-cart)
   - [POST /cart/items](#2-post-cartitems)
   - [PUT /cart/items/:itemId](#3-put-cartitemsitemid)
   - [DELETE /cart/items/:itemId](#4-delete-cartitemsitemid)
   - [DELETE /cart](#5-delete-cart)
   - [POST /cart/merge](#6-post-cartmerge)
5. [Guest Cart Strategy (Pre-Login)](#guest-cart-strategy-pre-login)
6. [Error Reference](#error-reference)
7. [Integration Checklist](#integration-checklist)

---

## Overview

The cart is **user-scoped** (one cart per authenticated user). The server creates a cart automatically on the first `GET /cart` call. Prices are **always sourced from the database** — never trust or send client-side prices.

### Key Rules
- Every endpoint **requires a JWT token** in the `Authorization` header.
- Quantities default to **1** when omitted.
- Maximum quantity per item is **99**.
- Adding an item that already exists in the cart **increases** its quantity (it does not create a duplicate).
- `totalAmount` and `subtotal` are always numbers (no string formatting needed on your end).

---

## Authentication

All requests must include:

```http
Authorization: Bearer <access_token>
```

Tokens are obtained from the auth endpoints (`/api/auth/login` or `/api/auth/google`).

---

## Data Models

### `CartItemResponse`

| Field            | Type             | Description                              |
|------------------|------------------|------------------------------------------|
| `id`             | `string (UUID)`  | Unique ID of this cart item              |
| `serviceId`      | `string (UUID)`  | ID of the associated service             |
| `serviceTitle`   | `string \| null` | Display name of the service              |
| `serviceSlug`    | `string \| null` | URL-friendly slug for navigation         |
| `serviceIconUrl` | `string \| null` | Icon image URL (for thumbnails)          |
| `serviceImageUrl`| `string \| null` | Cover image URL (for detailed views)     |
| `quantity`       | `number`         | Number of units in cart                  |
| `unitPrice`      | `number`         | Price per unit (SAR)                     |
| `subtotal`       | `number`         | `unitPrice × quantity`                   |

### `CartResponse`

| Field          | Type                  | Description                          |
|----------------|-----------------------|--------------------------------------|
| `id`           | `string (UUID)`       | Unique cart ID                       |
| `userId`       | `number`              | Owner's user ID                      |
| `items`        | `CartItemResponse[]`  | Array of items in the cart           |
| `totalItems`   | `number`              | Sum of all item quantities           |
| `totalAmount`  | `number`              | Total price of all items (SAR)       |
| `createdAt`    | `string (ISO 8601)`   | Cart creation timestamp              |
| `updatedAt`    | `string (ISO 8601)`   | Last modification timestamp          |

---

## Endpoints

---

### 1. `GET /cart`

**Get the authenticated user's cart.**  
Creates an empty cart automatically if none exists.

#### Request

```http
GET /api/cart
Authorization: Bearer <token>
```

> No query parameters. No request body.

#### Success Response — `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": 42,
  "items": [
    {
      "id": "f1e2d3c4-b5a6-7890-fedc-ba9876543210",
      "serviceId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "serviceTitle": "Logo Design",
      "serviceSlug": "logo-design",
      "serviceIconUrl": "https://cdn.sanad.sa/icons/logo-design.png",
      "serviceImageUrl": "https://cdn.sanad.sa/covers/logo-design.jpg",
      "quantity": 2,
      "unitPrice": 500,
      "subtotal": 1000
    }
  ],
  "totalItems": 2,
  "totalAmount": 1000,
  "createdAt": "2026-04-30T06:00:00.000Z",
  "updatedAt": "2026-04-30T07:30:00.000Z"
}
```

#### Empty Cart Response — `200 OK`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": 42,
  "items": [],
  "totalItems": 0,
  "totalAmount": 0,
  "createdAt": "2026-04-30T06:00:00.000Z",
  "updatedAt": "2026-04-30T06:00:00.000Z"
}
```

---

### 2. `POST /cart/items`

**Add a service to the cart.**  
If the service is already in the cart, its quantity is **incremented** by the provided value.

#### Request

```http
POST /api/cart/items
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Field       | Type     | Required | Constraints             | Default |
|-------------|----------|----------|-------------------------|---------|
| `serviceId` | `string` | ✅ Yes   | Must be a valid UUID    | —       |
| `quantity`  | `number` | ❌ No    | Integer, min: `1`       | `1`     |

```json
{
  "serviceId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "quantity": 1
}
```

#### Success Response — `201 Created`

Returns the **full updated cart** (same shape as `GET /cart`).

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": 42,
  "items": [
    {
      "id": "f1e2d3c4-b5a6-7890-fedc-ba9876543210",
      "serviceId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "serviceTitle": "Logo Design",
      "serviceSlug": "logo-design",
      "serviceIconUrl": "https://cdn.sanad.sa/icons/logo-design.png",
      "serviceImageUrl": "https://cdn.sanad.sa/covers/logo-design.jpg",
      "quantity": 1,
      "unitPrice": 500,
      "subtotal": 500
    }
  ],
  "totalItems": 1,
  "totalAmount": 500,
  "createdAt": "2026-04-30T06:00:00.000Z",
  "updatedAt": "2026-04-30T07:35:00.000Z"
}
```

#### Error — `404 Not Found` (service doesn't exist)

```json
{
  "statusCode": 404,
  "message": "Service with ID \"c3d4e5f6-a7b8-9012-cdef-123456789012\" not found",
  "error": "Not Found"
}
```

---

### 3. `PUT /cart/items/:itemId`

**Update the quantity of a specific cart item.**

#### Request

```http
PUT /api/cart/items/f1e2d3c4-b5a6-7890-fedc-ba9876543210
Authorization: Bearer <token>
Content-Type: application/json
```

#### Path Parameters

| Param    | Type     | Required | Description                   |
|----------|----------|----------|-------------------------------|
| `itemId` | `string` | ✅ Yes   | UUID of the cart item to update |

#### Request Body

| Field      | Type     | Required | Constraints       | Description              |
|------------|----------|----------|-------------------|--------------------------|
| `quantity` | `number` | ❌ No    | Integer, min: `1` | New absolute quantity    |

> ⚠️ `quantity` is the **new absolute value**, not a delta. To set 3 units, send `3`.

```json
{
  "quantity": 3
}
```

#### Success Response — `200 OK`

Returns the **full updated cart**.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": 42,
  "items": [
    {
      "id": "f1e2d3c4-b5a6-7890-fedc-ba9876543210",
      "serviceId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "serviceTitle": "Logo Design",
      "serviceSlug": "logo-design",
      "serviceIconUrl": "https://cdn.sanad.sa/icons/logo-design.png",
      "serviceImageUrl": "https://cdn.sanad.sa/covers/logo-design.jpg",
      "quantity": 3,
      "unitPrice": 500,
      "subtotal": 1500
    }
  ],
  "totalItems": 3,
  "totalAmount": 1500,
  "createdAt": "2026-04-30T06:00:00.000Z",
  "updatedAt": "2026-04-30T07:40:00.000Z"
}
```

#### Error — `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Cart item with ID \"f1e2d3c4-b5a6-7890-fedc-ba9876543210\" not found",
  "error": "Not Found"
}
```

#### Error — `400 Bad Request` (quantity < 1)

```json
{
  "statusCode": 400,
  "message": "Quantity must be at least 1",
  "error": "Bad Request"
}
```

> 💡 **UX Tip:** To remove an item when the user decrements to 0, call `DELETE /cart/items/:itemId` instead of sending `quantity: 0` (which will return a 400).

---

### 4. `DELETE /cart/items/:itemId`

**Remove a single item from the cart.**

#### Request

```http
DELETE /api/cart/items/f1e2d3c4-b5a6-7890-fedc-ba9876543210
Authorization: Bearer <token>
```

> No request body.

#### Path Parameters

| Param    | Type     | Required | Description                   |
|----------|----------|----------|-------------------------------|
| `itemId` | `string` | ✅ Yes   | UUID of the cart item to remove |

#### Success Response — `200 OK`

Returns the **full updated cart** (without the removed item).

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": 42,
  "items": [],
  "totalItems": 0,
  "totalAmount": 0,
  "createdAt": "2026-04-30T06:00:00.000Z",
  "updatedAt": "2026-04-30T07:45:00.000Z"
}
```

#### Error — `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Cart item with ID \"f1e2d3c4-b5a6-7890-fedc-ba9876543210\" not found",
  "error": "Not Found"
}
```

---

### 5. `DELETE /cart`

**Clear all items from the cart.**  
The cart entity itself is preserved (only items are deleted, `totalAmount` is reset to `0`).

#### Request

```http
DELETE /api/cart
Authorization: Bearer <token>
```

> No request body.

#### Success Response — `200 OK`

```json
{
  "message": "Cart cleared successfully"
}
```

> ⚠️ Note: This endpoint returns a simple message object, **not** the full cart response.

---

### 6. `POST /cart/merge`

**Merge a guest (localStorage) cart into the authenticated user's cart.**  
Call this **immediately after a successful login** to preserve items added while the user was unauthenticated.

#### How it Works
- Services that don't exist → skipped, reported in `failedItems`
- Item already in user cart → quantities are **added together** (capped at 99)
- Prices are **always fetched from the database** — client-side prices in `localStorage` are ignored

#### Request

```http
POST /api/cart/merge
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

| Field           | Type               | Required | Description                                |
|-----------------|--------------------|----------|--------------------------------------------|
| `items`         | `GuestCartItem[]`  | ✅ Yes   | Array of items from the guest cart         |
| `items[].serviceId` | `string`       | ✅ Yes   | UUID of the service                        |
| `items[].quantity`  | `number`       | ✅ Yes   | Integer, min: `1`, max: `99`              |

```json
{
  "items": [
    {
      "serviceId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "quantity": 2
    },
    {
      "serviceId": "d4e5f6a7-b8c9-0123-defg-234567890123",
      "quantity": 1
    }
  ]
}
```

#### Success Response — `200 OK` (full merge)

```json
{
  "success": true,
  "message": "Cart merged successfully",
  "cart": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": 42,
    "items": [
      {
        "id": "f1e2d3c4-b5a6-7890-fedc-ba9876543210",
        "serviceId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "serviceTitle": "Logo Design",
        "serviceSlug": "logo-design",
        "serviceIconUrl": "https://cdn.sanad.sa/icons/logo-design.png",
        "serviceImageUrl": "https://cdn.sanad.sa/covers/logo-design.jpg",
        "quantity": 2,
        "unitPrice": 500,
        "subtotal": 1000
      },
      {
        "id": "e2d3c4b5-a6f7-8901-edcb-a09876543210",
        "serviceId": "d4e5f6a7-b8c9-0123-defg-234567890123",
        "serviceTitle": "Brand Identity",
        "serviceSlug": "brand-identity",
        "serviceIconUrl": "https://cdn.sanad.sa/icons/brand-identity.png",
        "serviceImageUrl": null,
        "quantity": 1,
        "unitPrice": 1500,
        "subtotal": 1500
      }
    ],
    "totalItems": 3,
    "totalAmount": 2500,
    "createdAt": "2026-04-30T06:00:00.000Z",
    "updatedAt": "2026-04-30T08:00:00.000Z"
  },
  "failedItems": []
}
```

#### Partial Success Response — `200 OK` (some items failed)

```json
{
  "success": true,
  "message": "Partially merged: 1 of 2 items",
  "cart": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": 42,
    "items": [
      {
        "id": "f1e2d3c4-b5a6-7890-fedc-ba9876543210",
        "serviceId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "serviceTitle": "Logo Design",
        "serviceSlug": "logo-design",
        "serviceIconUrl": "https://cdn.sanad.sa/icons/logo-design.png",
        "serviceImageUrl": "https://cdn.sanad.sa/covers/logo-design.jpg",
        "quantity": 2,
        "unitPrice": 500,
        "subtotal": 1000
      }
    ],
    "totalItems": 2,
    "totalAmount": 1000,
    "createdAt": "2026-04-30T06:00:00.000Z",
    "updatedAt": "2026-04-30T08:00:00.000Z"
  },
  "failedItems": [
    {
      "serviceId": "d4e5f6a7-b8c9-0123-defg-234567890123",
      "reason": "Service not found or unavailable"
    }
  ]
}
```

#### Full Failure Response — `200 OK` (all items failed)

```json
{
  "success": false,
  "message": "No items could be merged",
  "cart": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": 42,
    "items": [],
    "totalItems": 0,
    "totalAmount": 0,
    "createdAt": "2026-04-30T06:00:00.000Z",
    "updatedAt": "2026-04-30T08:00:00.000Z"
  },
  "failedItems": [
    {
      "serviceId": "invalid-id-1",
      "reason": "Service not found or unavailable"
    },
    {
      "serviceId": "invalid-id-2",
      "reason": "Maximum quantity limit (99) exceeded"
    }
  ]
}
```

> ⚠️ The merge endpoint **always returns 200** regardless of how many items failed. Use the `success` field and `failedItems` array to determine what happened.

---

## Guest Cart Strategy (Pre-Login)

For unauthenticated users, persist cart data in `localStorage` using this structure:

```ts
// localStorage key: "guest_cart"
interface GuestCartItem {
  serviceId: string;
  quantity: number;
  // Optional: cache display info locally for rendering
  serviceTitle?: string;
  serviceSlug?: string;
  serviceIconUrl?: string | null;
  unitPrice?: number; // display only — never sent as source of truth
}
```

### Recommended Login Flow

```ts
async function onLoginSuccess(token: string) {
  // 1. Save the token
  localStorage.setItem('access_token', token);

  // 2. Read the guest cart
  const raw = localStorage.getItem('guest_cart');
  const guestItems: GuestCartItem[] = raw ? JSON.parse(raw) : [];

  // 3. Merge if there are items
  if (guestItems.length > 0) {
    await fetch('/api/cart/merge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: guestItems.map(({ serviceId, quantity }) => ({ serviceId, quantity })),
      }),
    });

    // 4. Clear guest cart after merge
    localStorage.removeItem('guest_cart');
  }

  // 5. Fetch and display the updated cart
  await refreshCart(token);
}
```

---

## Error Reference

| HTTP Status | Trigger                                                        |
|-------------|----------------------------------------------------------------|
| `400`       | Invalid body (missing `serviceId`, `quantity < 1`, wrong type) |
| `401`       | Missing or expired JWT token                                   |
| `404`       | `serviceId` or `itemId` not found                             |
| `422`       | Validation error (body field fails class-validator rules)      |

### Generic Validation Error Shape — `422`

```json
{
  "statusCode": 422,
  "message": [
    "serviceId must be a UUID",
    "quantity must not be less than 1"
  ],
  "error": "Unprocessable Entity"
}
```

---

## Integration Checklist

- [ ] Store JWT token securely (httpOnly cookie preferred, or `localStorage` for SPAs)
- [ ] Call `GET /cart` on app load (after authentication is confirmed)
- [ ] Store guest cart in `localStorage` under key `guest_cart` as an array of `{ serviceId, quantity }`
- [ ] Call `POST /cart/merge` immediately after every login success, before navigating away
- [ ] Clear `guest_cart` from `localStorage` after a successful merge
- [ ] Use `PUT /cart/items/:itemId` for quantity updates, **not** delete + re-add
- [ ] When a user decrements quantity to 0, call `DELETE /cart/items/:itemId` instead
- [ ] Display `totalItems` in the cart badge/icon in the navigation header
- [ ] Display `totalAmount` formatted as SAR currency (`new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' })`)
- [ ] Handle `failedItems` from `/cart/merge` gracefully — show a toast or warning if any items couldn't be merged
- [ ] Never send prices from the frontend — the API always pulls prices from the database

---

*Last updated: 2026-04-30 — Based on `CartController` v1 and `CartService` v1*
