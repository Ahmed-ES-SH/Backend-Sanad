# Auth API Documentation

> For frontend developers integrating with the Authentication module.

**Base URL:** `/api` (adjust based on your environment)

---

## Table of Contents

- [Data Model](#data-model)
- [Public Endpoints](#public-endpoints)
- [Protected Endpoints](#protected-endpoints)
- [DTOs](#dtos)
- [Error Responses](#error-responses)
- [Notes for Frontend](#notes-for-frontend)

---

## Data Model

### User Entity (Auth-relevant fields)

| Field             | Type           | Description                 |
| ----------------- | -------------- | --------------------------- |
| `id`              | `number`       | Auto-increment primary key  |
| `email`           | `string`       | Unique, required            |
| `name`            | `string`       | Optional, unique            |
| `avatar`          | `string`       | Optional, avatar URL        |
| `role`            | `UserRoleEnum` | `USER` (default) or `ADMIN` |
| `isEmailVerified` | `boolean`      | Email verification status   |
| `googleId`        | `string`       | Google OAuth ID (optional)  |
| `createdAt`       | `Date`         | Account creation timestamp  |
| `updatedAt`       | `Date`         | Last update timestamp       |

### Token Response

| Field          | Type     | Description                    |
| -------------- | -------- | ------------------------------ |
| `access_token` | `string` | JWT token for authentication   |
| `user`         | `object` | User object (without password) |

---

## Public Endpoints

### POST `/api/auth/login`

Authenticate a user with email and password.

**Request Body** (`LoginDto`):

| Field      | Type     | Required | Description   |
| ---------- | -------- | -------- | ------------- |
| `email`    | `string` | yes      | Valid email   |
| `password` | `string` | yes      | User password |

**Response (Success):**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "avatar": "https://...",
    "isEmailVerified": true
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (Email not verified):**

```json
{
  "message": "you need to verify your email first"
}
```

**Status Codes:**

- `200` — Login successful or email not verified message
- `400` — Invalid email or password

---

### POST `/api/auth/verify-email`

Verify a user's email address using the token sent to their email.

**Query Parameters:**

| Parameter | Type     | Required | Description                   |
| --------- | -------- | -------- | ----------------------------- |
| `token`   | `string` | yes      | Verification token from email |

**Response:**

```json
{
  "message": "Email verified successfully"
}
```

**Status Codes:**

- `200` — Email verified
- `400` — Invalid/expired token, already verified, or missing token

---

### POST `/api/auth/rest-password/send`

Send a password reset link to the user's email.

**Rate Limit:** Max 3 requests per 15 minutes.

**Request Body** (`sendResetPasswordDTO`):

| Field   | Type     | Required | Description  |
| ------- | -------- | -------- | ------------ |
| `email` | `string` | yes      | User's email |

**Response:**

```json
{
  "message": "If an account exists with this email, a reset link has been sent."
}
```

**Note:** The response is the same whether the email exists or not (security best practice).

**Status Codes:**

- `200` — Reset email sent (or email not found)
- `400` — Validation error
- `429` — Rate limit exceeded

---

### POST `/api/auth/rest-password/verify`

Verify a password reset token before allowing password change.

**Rate Limit:** Max 5 requests per 15 minutes.

**Request Body** (`verifyRestTokenDTO`):

| Field   | Type     | Required | Description            |
| ------- | -------- | -------- | ---------------------- |
| `token` | `string` | yes      | Reset token from email |
| `email` | `string` | yes      | User's email           |

**Response:**

```json
{
  "message": "This token is valid",
  "userId": 1
}
```

**Status Codes:**

- `200` — Token is valid
- `400` — Invalid token, expired, or user not found
- `429` — Rate limit exceeded

---

### POST `/api/auth/rest-password`

Reset the user's password using a verified token.

**Rate Limit:** Max 5 requests per hour.

**Request Body** (`ResetPasswordDto`):

| Field      | Type     | Required | Description                |
| ---------- | -------- | -------- | -------------------------- |
| `email`    | `string` | yes      | User's email               |
| `password` | `string` | yes      | New password (min 6 chars) |
| `token`    | `string` | yes      | Reset token from email     |

**Response:**

```json
{
  "message": "password changed successfully"
}
```

**Status Codes:**

- `200` — Password changed
- `400` — Invalid/expired token or validation error
- `429` — Rate limit exceeded

---

### GET `/api/auth/google`

Initiate Google OAuth2 login flow. Redirects the user to Google's consent screen.

**No request body needed.** The browser is redirected to Google.

---

### GET `/api/auth/google/callback`

Handle the callback from Google OAuth2. After successful authentication, redirects to the frontend with the token.

**Redirect URL:**

```
{FRONTEND_URL}/auth/callback?token={access_token}
```

**Response:** Redirects to frontend with JWT token in query param.

---

## Protected Endpoints

All endpoints below require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### GET `/api/auth/current-user`

Get the profile of the currently authenticated user.

**Response:** User object (without password).

**Status Codes:**

- `200` — User profile returned
- `401` — Invalid or missing token

---

### POST `/api/auth/logout`

Logout the current user by blacklisting their JWT token.

**Request Body** (`logoutDTO`):

| Field   | Type     | Required | Description            |
| ------- | -------- | -------- | ---------------------- |
| `token` | `string` | yes      | JWT token to blacklist |

**Response:**

```json
{
  "message": "User logged out successfully"
}
```

**Status Codes:**

- `200` — Logged out successfully
- `401` — Invalid or missing token

---

## DTOs

### LoginDto

```typescript
interface LoginDto {
  email: string;
  password: string;
}
```

### logoutDTO

```typescript
interface logoutDTO {
  token: string; // JWT token to blacklist
}
```

### sendResetPasswordDTO

```typescript
interface sendResetPasswordDTO {
  email: string;
}
```

### verifyRestTokenDTO

```typescript
interface verifyRestTokenDTO {
  token: string;
  email: string;
}
```

### ResetPasswordDto

```typescript
interface ResetPasswordDto {
  email: string;
  password: string; // min 6 chars
  token: string;
}
```

---

## Error Responses

| Status | Description                                               |
| ------ | --------------------------------------------------------- |
| `400`  | Bad Request — invalid input, invalid token, expired token |
| `401`  | Unauthorized — missing/invalid JWT token                  |
| `429`  | Too Many Requests — rate limit hit                        |

---

## Notes for Frontend

1. **Token storage:** Store the `access_token` securely (e.g., `localStorage`, `sessionStorage`, or httpOnly cookie). Include it in the `Authorization` header for all protected requests.

2. **Email verification required:** Users must verify their email before they can log in. If they try to login without verification, they'll receive a message and a new verification email will be sent.

3. **Password reset flow:**
   - Step 1: `POST /api/auth/rest-password/send` — sends reset email
   - Step 2: `POST /api/auth/rest-password/verify` — validates the token (optional, for UX)
   - Step 3: `POST /api/auth/rest-password` — actually resets the password

4. **Google OAuth flow:**
   - Redirect user to `GET /api/auth/google`
   - Google handles authentication
   - Backend redirects to `{FRONTEND_URL}/auth/callback?token=xxx`
   - Frontend extracts the token from the URL query param

5. **Token expiry:** JWT tokens have a configurable expiry (set via `JWT_EXPIRES_IN` env var). Handle `401` responses by redirecting to login.

6. **Logout requires token:** The logout endpoint requires the JWT token in both the `Authorization` header AND the request body. This is for blacklisting purposes.

7. **Rate limits:** Password reset endpoints are rate-limited. Show appropriate error messages to users when they hit the limit.
