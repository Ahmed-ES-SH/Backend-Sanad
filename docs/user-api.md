# User API Documentation

> For frontend developers integrating with the User module.

**Base URL:** `/api` (adjust based on your environment)

---

## Table of Contents

- [Data Model](#data-model)
- [Endpoints](#endpoints)
- [DTOs](#dtos)
- [Error Responses](#error-responses)
- [Notes for Frontend](#notes-for-frontend)

---

## Data Model

### User Entity

| Field                          | Type           | Description                                |
| ------------------------------ | -------------- | ------------------------------------------ |
| `id`                           | `number`       | Auto-increment primary key                 |
| `email`                        | `string`       | Unique, required                           |
| `password`                     | `string`       | Hashed (Argon2), not returned in responses |
| `name`                         | `string`       | Optional, unique                           |
| `avatar`                       | `string`       | Optional, avatar URL                       |
| `role`                         | `UserRoleEnum` | `USER` (default) or `ADMIN`                |
| `googleId`                     | `string`       | Google OAuth ID (optional, unique)         |
| `isEmailVerified`              | `boolean`      | Email verification status                  |
| `emailVerificationToken`       | `string`       | Token for email verification (internal)    |
| `emailVerificationTokenExpiry` | `Date`         | Token expiry (internal)                    |
| `passwordResetToken`           | `string`       | Token for password reset (internal)        |
| `passwordResetTokenExpiry`     | `Date`         | Token expiry (internal)                    |
| `createdAt`                    | `Date`         | Account creation timestamp                 |
| `updatedAt`                    | `Date`         | Last update timestamp                      |

---

## Endpoints

All endpoints are under `/api/user`.

### POST `/api/user`

Create a new user account.

**Request Body** (`CreateUserDto`):

| Field      | Type     | Required | Description                |
| ---------- | -------- | -------- | -------------------------- |
| `email`    | `string` | yes      | Valid email, unique        |
| `password` | `string` | yes      | Will be hashed with Argon2 |
| `name`     | `string` | no       | Display name, unique       |
| `avatar`   | `string` | no       | Avatar URL                 |
| `googleId` | `string` | no       | Google OAuth ID            |

**Response:** Created `User` object.

**Status Codes:**

- `201` — User created
- `400` — User already exists or validation error

---

### GET `/api/user`

List all users.

**Response:** Array of `User` objects.

**Note:** No pagination — returns all users.

---

### GET `/api/user/:id`

Get a single user by ID.

**Path Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `number` | User ID     |

**Response:** Single `User` object.

**Status Codes:**

- `200` — User found
- `400` — User not found

---

### PATCH `/api/user/:id`

Update an existing user.

**Path Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `number` | User ID     |

**Request Body** (`UpdateUserDto`): All fields optional.

| Field             | Type           | Description                  |
| ----------------- | -------------- | ---------------------------- |
| `name`            | `string`       | Display name                 |
| `email`           | `string`       | Email (only if not verified) |
| `avatar`          | `string`       | Avatar URL                   |
| `role`            | `UserRoleEnum` | `USER` or `ADMIN`            |
| `password`        | `string`       | Min 6 chars, will be hashed  |
| `isEmailVerified` | `boolean`      | Email verification status    |

**Note:** Email can only be updated if `isEmailVerified` is `false`.

**Response:** Updated `User` object.

**Status Codes:**

- `200` — User updated
- `400` — User not found or validation error

---

### DELETE `/api/user/:id`

Delete a user.

**Path Parameters:**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `number` | User ID     |

**Response:** Deleted `User` object.

**Status Codes:**

- `200` — User deleted
- `400` — User not found

---

## DTOs

### CreateUserDto

```typescript
interface CreateUserDto {
  email: string; // required, valid email, unique
  password: string; // required, will be hashed
  name?: string; // optional, unique
  avatar?: string; // optional, URL
  googleId?: string; // optional, unique
}
```

### UpdateUserDto

```typescript
interface UpdateUserDto {
  name?: string;
  email?: string; // only updatable if isEmailVerified = false
  avatar?: string;
  role?: 'USER' | 'ADMIN';
  password?: string; // min 6 chars
  isEmailVerified?: boolean;
}
```

---

## Error Responses

| Status | Description                                                    |
| ------ | -------------------------------------------------------------- |
| `400`  | Bad Request — user not found, already exists, validation error |

---

## Notes for Frontend

1. **User ID is numeric:** Unlike other modules that use UUIDs, user IDs are auto-increment numbers.

2. **Email restriction:** Email can only be changed if the user's email is not yet verified. This prevents users from changing their email after verification.

3. **Password hashing:** Passwords are automatically hashed with Argon2 on create and update. You never need to hash passwords on the frontend.

4. **No authentication guards:** The user controller currently has no authentication guards. This means all endpoints are publicly accessible. Consider adding guards before production use.

5. **No pagination on list:** `GET /api/user` returns all users at once. For large user bases, consider adding pagination.

6. **Role enum:** Valid roles are `USER` (default) and `ADMIN`.
