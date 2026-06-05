# Users Management Integration Plan

## 1. Overview

This plan defines the integration strategy for the Users Management module. This module exists exclusively inside the protected admin dashboard and dictates how administrators can view, add, modify, or remove users from the platform. Robust security is required, and all actions will strictly execute on the server using the Next.js API logic, injecting the admin's `Bearer Token` into all communications with the NestJS backend. All endpoints are protected by a global `AuthGuard` that validates JWT tokens and checks against the token blacklist.

---

## 2. Data Models

### User Entity

```typescript
interface User {
  id: number;                           // Auto-increment primary key
  email: string;                        // Unique, required
  password: string;                     // Argon2-hashed, excluded from responses by default
  name: string | null;                  // Unique, optional
  avatar: string | null;                // Profile image URL
  role: 'admin' | 'user';               // Default: 'user'
  googleId: string | null;              // Unique, optional (OAuth identifier)
  isEmailVerified: boolean;             // Default: false
  emailVerificationToken: string | null;
  emailVerificationTokenExpiry: Date | null;
  passwordResetToken: string | null;
  passwordResetTokenExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Backend API Endpoints (`/user`)

All endpoints are protected by the global `AuthGuard`. A valid JWT token must be included in the `Authorization: Bearer <token>` header. The guard verifies:
- Token is present and valid
- Token is not blacklisted
- Token has not expired

---

#### `GET /user`

Fetches the complete list of all registered users. No pagination — returns all users.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Request:**
```
GET /user
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "admin@sanad.com",
    "name": "Ahmed",
    "avatar": "https://cdn.example.com/avatars/ahmed.jpg",
    "role": "admin",
    "googleId": null,
    "isEmailVerified": true,
    "createdAt": "2026-01-10T09:00:00.000Z",
    "updatedAt": "2026-03-20T14:30:00.000Z"
  },
  {
    "id": 2,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null,
    "role": "user",
    "googleId": "1234567890-google-oauth-id",
    "isEmailVerified": true,
    "createdAt": "2026-02-15T11:00:00.000Z",
    "updatedAt": "2026-02-15T11:00:00.000Z"
  },
  {
    "id": 3,
    "email": "pending@example.com",
    "name": null,
    "avatar": null,
    "role": "user",
    "googleId": null,
    "isEmailVerified": false,
    "createdAt": "2026-04-01T08:00:00.000Z",
    "updatedAt": "2026-04-01T08:00:00.000Z"
  }
]
```

**Empty Response (200 OK):**
```json
[]
```

**Error Responses:**

| Status | Body |
|--------|------|
| `401 Unauthorized` | `{"statusCode": 401, "message": "Please provide a valid bearer token", "error": "Unauthorized"}` |
| `401 Unauthorized` | `{"statusCode": 401, "message": "Invalid or expired token", "error": "Unauthorized"}` |
| `401 Unauthorized` | `{"statusCode": 401, "message": "This token has been revoked", "error": "Unauthorized"}` |

---

#### `GET /user/:id`

Fetches details for a specific user by their numeric ID.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| `id`      | number | Yes      | User ID (e.g., `1`) |

**Example Request:**
```
GET /user/1
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "email": "admin@sanad.com",
  "name": "Ahmed",
  "avatar": "https://cdn.example.com/avatars/ahmed.jpg",
  "role": "admin",
  "googleId": null,
  "isEmailVerified": true,
  "createdAt": "2026-01-10T09:00:00.000Z",
  "updatedAt": "2026-03-20T14:30:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "The user not found .", "error": "Bad Request"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |

---

#### `POST /user`

Creates a new user. This endpoint is shared between the public `/signup` flow (mapped in `AUTH_PLAN.md`) and admin dashboard user creation. The password is hashed with Argon2 before storage.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

| Field      | Type   | Required | Description                          |
|------------|--------|----------|--------------------------------------|
| `email`    | string | Yes      | User email (must be unique)          |
| `password` | string | Yes      | Plain-text password (will be hashed) |
| `name`     | string | No       | Display name (must be unique)        |
| `avatar`   | string | No       | Profile image URL                    |
| `googleId` | string | No       | Google OAuth identifier              |

**Example Request — Admin creating a user:**
```json
{
  "email": "newuser@example.com",
  "password": "TempPass123!",
  "name": "New User",
  "avatar": "https://cdn.example.com/avatars/newuser.jpg"
}
```

**Success Response (201 Created):**
```json
{
  "id": 4,
  "email": "newuser@example.com",
  "name": "New User",
  "avatar": "https://cdn.example.com/avatars/newuser.jpg",
  "role": "user",
  "googleId": null,
  "isEmailVerified": false,
  "createdAt": "2026-04-07T14:30:00.000Z",
  "updatedAt": "2026-04-07T14:30:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "The user is Already Exists", "error": "Bad Request"}` |
| `400 Bad Request` | Validation error (invalid email format, missing required fields) |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |

---

#### `PATCH /user/:id`

Updates an existing user's details. Supports partial updates — only provided fields are modified. Admins can change roles, reset passwords, toggle email verification, and edit profile data.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| `id`      | number | Yes      | User ID (e.g., `1`) |

**Request Body:**

| Field             | Type    | Required | Min Length | Description                              |
|-------------------|---------|----------|------------|------------------------------------------|
| `name`            | string  | No       | —          | Display name                             |
| `email`           | string  | No       | —          | Email address                            |
| `avatar`          | string  | No       | —          | Profile image URL                        |
| `role`            | string  | No       | —          | User role: `admin` or `user`             |
| `password`        | string  | No       | 6          | New password (will be Argon2-hashed)     |
| `isEmailVerified` | boolean | No       | —          | Toggle email verification status         |

**Example Request — Admin updating a user:**
```json
{
  "name": "Updated Name",
  "role": "admin",
  "isEmailVerified": true
}
```

**Example Request — Admin resetting a user's password:**
```json
{
  "password": "NewSecurePass456"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "email": "admin@sanad.com",
  "name": "Updated Name",
  "avatar": "https://cdn.example.com/avatars/ahmed.jpg",
  "role": "admin",
  "googleId": null,
  "isEmailVerified": true,
  "createdAt": "2026-01-10T09:00:00.000Z",
  "updatedAt": "2026-04-07T15:45:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "The user is not found", "error": "Bad Request"}` |
| `400 Bad Request` | Validation error (invalid email format, password too short, invalid role) |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |

---

#### `DELETE /user/:id`

Permanently deletes a user account from the system.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| `id`      | number | Yes      | User ID (e.g., `1`) |

**Example Request:**
```
DELETE /user/3
```

**Success Response (200 OK):**
```json
{
  "id": 3,
  "email": "pending@example.com",
  "name": null,
  "avatar": null,
  "role": "user",
  "googleId": null,
  "isEmailVerified": false,
  "createdAt": "2026-04-01T08:00:00.000Z",
  "updatedAt": "2026-04-01T08:00:00.000Z"
}
```

**Error Responses:**

| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "The user is not found", "error": "Bad Request"}` |
| `401 Unauthorized` | Invalid, expired, or missing JWT token |

---

## 4. Server Components & Data Fetching

Fetching data directly via Server Components ensures the dashboard loads quickly and restricts sensitive data fetching completely to the server layer.

### Dashboard Admin Directory: `app/[local]/dashboard/users`

- **`dashboard/users/page.tsx`** — Uses `GET /user`. It will display a comprehensive data table of all system users with columns for ID, name, email, role, verification status, and actions.
- **`dashboard/users/[id]/page.tsx`** — Uses `GET /user/:id`. The server will fetch user records and instantiate an edit form. Admins can update roles, fix typos in profiles, or handle password resets manually if required.

---

## 5. Creating the Add User Page

Administrators need the ability to manually invite or create system users.

- **Path:** `app/[local]/dashboard/users/create/page.tsx` (or `new/page.tsx`).
- **Functionality:** Create a form tailored for admin usage. Unlike the public signup form, this form might include advanced fields such as assigning specific system roles (Admin, Editor, User), bypassing email verification automatically, or setting up a temporary password.
- **Integration:** The form will hook into the `POST /user` endpoint via a Server Action.

---

## 6. Server Actions (Mutations)

All admin mutations for user entities should be grouped inside a new action file: `app/actions/userActions.ts`. This ensures tight security and validation before forwarding the request to NestJS.

**Planned Actions:**

| Action | Backend Endpoint | Description |
|--------|-----------------|-------------|
| `adminCreateUser(formData)` | `POST /user` | Creates a new user manually from the dashboard |
| `adminUpdateUser(id, formData)` | `PATCH /user/:id` | Updates an existing user's details. Triggers `revalidatePath('/dashboard/users')` on success. |
| `adminDeleteUser(id)` | `DELETE /user/:id` | Permanently deletes a user. Triggers `revalidatePath('/dashboard/users')` on success. |

Cache strategy: Upon successful addition, edition, or deletion of a user, the action must trigger `revalidatePath('/dashboard/users')` to refresh the main admin list immediately.

---

## 7. Implementation Steps

1. **Develop the "Add User" Screen:** Scaffold the `dashboard/users/create/page.tsx` with role-selection capabilities.
2. **Build Server Actions:** Scaffold `app/actions/userActions.ts` with the admin-facing CRUD methods, linking the Bearer Token securely.
3. **Connect the Dashboard Table UI:** Map `GET /user` data into `dashboard/users/page.tsx`. Implement inline actions for deletion (with confirmations) or linking to the edit page.
4. **Connect the Edit User UI:** Wire up `dashboard/users/[id]/page.tsx` with `GET /user/:id` and hook the form submission to `adminUpdateUser`.

---

## 8. Key Business Rules

| Rule | Details |
|------|---------|
| **Global auth protection** | All `/user` endpoints require a valid JWT Bearer token via the global `AuthGuard` |
| **Token blacklist check** | The guard verifies the token is not blacklisted before allowing access |
| **Password hashing** | All passwords are hashed with Argon2 before storage (both on create and update) |
| **Email uniqueness** | Email addresses must be unique across the platform |
| **Name uniqueness** | Display names must also be unique |
| **Partial updates** | `PATCH /user/:id` only modifies provided fields |
| **Email field restricted when verified** | If `isEmailVerified` is `true`, the email field cannot be changed via update |
| **Role enum** | Only `admin` or `user` roles are accepted |
| **Password minimum length** | Passwords must be at least 6 characters when updating |
| **No pagination on list** | `GET /user` returns all users — consider adding pagination for large datasets |
| **Caching** | `findById` method uses cache-manager with `user_{id}` key pattern |
| **Shared endpoint** | `POST /user` is used by both public signup and admin user creation |
