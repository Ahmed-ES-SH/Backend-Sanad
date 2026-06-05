# Auth Implementation Plan

## 1. Overview

The goal is to implement secure authentication logic leveraging Server-Side rendering (Next.js App Router). We will interact with the backend API via the endpoints defined in `app/constants/endpoints.ts`. Next.js server logic (Server Actions and API Routes) will act as a bridge between the frontend and the backend. The returned token will be stored securely as an `HttpOnly` cookie and will be used as a Bearer Token for subsequent authenticated requests.

---

## 2. Backend API Endpoints

### 2.1 Public Endpoints (`/auth`)

These endpoints do not require authentication and are accessible to all users.

---

#### `POST /auth/login`

Authenticates a user with email and password. Returns a JWT token if the email is verified.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200 OK) — Email verified:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Ahmed",
    "avatar": "https://example.com/avatar.jpg",
    "role": "user",
    "isEmailVerified": true,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-04-01T08:15:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK) — Email not verified:**
```json
{
  "message": "you need to verify your email first"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "Invalid email or password", "error": "Bad Request"}` |
| `429 Too Many Requests` | Rate limit exceeded |

---

#### `POST /auth/verify-email?token={token}`

Verifies a user's email address using the token sent to their email.

**Query Parameters:**
| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| `token`   | string | Yes      | Email verification token |

**Success Response (200 OK):**
```json
{
  "message": "Email verified successfully"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "The token is required", "error": "Bad Request"}` |
| `400 Bad Request` | `{"statusCode": 400, "message": "The user is already verified", "error": "Bad Request"}` |
| `400 Bad Request` | `{"statusCode": 400, "message": "Invalid or expired token", "error": "Bad Request"}` |

---

#### `POST /auth/rest-password/send`

Sends a password reset link to the user's registered email. Rate limited: **3 requests per 15 minutes**.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "If an account exists with this email, a reset link has been sent."
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| `429 Too Many Requests` | Rate limit exceeded (3 req / 15 min) |
| `400 Bad Request` | Validation error (invalid email format) |

---

#### `POST /auth/rest-password/verify`

Validates a password reset token before allowing a password change. Rate limited: **5 requests per 15 minutes**.

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "This token is valid",
  "userId": 1
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "Invalid token or user not found", "error": "Bad Request"}` |
| `400 Bad Request` | `{"statusCode": 400, "message": "Token has expired", "error": "Bad Request"}` |
| `400 Bad Request` | `{"statusCode": 400, "message": "Invalid token", "error": "Bad Request"}` |
| `429 Too Many Requests` | Rate limit exceeded (5 req / 15 min) |

---

#### `POST /auth/rest-password`

Resets the user's password using a verified token. Rate limited: **5 requests per 1 hour**.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "NewSecurePass456",
  "token": "a1b2c3d4e5f6..."
}
```

**Success Response (200 OK):**
```json
{
  "message": "password changed successfully"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| `400 Bad Request` | `{"statusCode": 400, "message": "Invalid request", "error": "Bad Request"}` |
| `400 Bad Request` | `{"statusCode": 400, "message": "Token has expired", "error": "Bad Request"}` |
| `400 Bad Request` | `{"statusCode": 400, "message": "Invalid token", "error": "Bad Request"}` |
| `429 Too Many Requests` | Rate limit exceeded (5 req / 1 hour) |

---

#### `GET /auth/google`

Initiates the Google OAuth2 login flow. Redirects the user to Google's consent screen.

**Response:** Redirects to Google OAuth consent page.

---

#### `GET /auth/google/callback`

Handles the callback from Google OAuth2. Redirects to the frontend with the JWT token.

**Query Parameters (added by Google):**
| Parameter | Type   | Description         |
|-----------|--------|---------------------|
| `code`    | string | OAuth authorization code |
| `state`   | string | CSRF state token    |

**Redirect URL:**
```
{FRONTEND_URL}/auth/callback?token={access_token}
```

**Example Redirect:**
```
http://localhost:3000/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MTI0OTYwMDAsImV4cCI6MTcxMjUwMzIwMH0.abc123
```

---

### 2.2 Protected Endpoints (`/auth`)

These endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

---

#### `POST /auth/logout`

Logs out the current user by blacklisting their token.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "message": "User logged out successfully"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| `401 Unauthorized` | Invalid or missing JWT token |
| `400 Bad Request` | Validation error (missing token in body) |

---

#### `GET /auth/current-user`

Retrieves the profile of the currently authenticated user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Ahmed",
  "avatar": "https://example.com/avatar.jpg",
  "role": "user",
  "isEmailVerified": true,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-04-01T08:15:00.000Z"
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| `401 Unauthorized` | Invalid, expired, or blacklisted JWT token |

---

## 3. Data Models

### User Entity
```typescript
interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user';
  isEmailVerified: boolean;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### JWT Payload
```typescript
interface JwtPayload {
  id: number;
  email: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}
```

---

## 4. Server-Side Link Integration (BFF Pattern)

To ensure high security and keep sensitive logic on the server:

- **Next.js Server Actions / API Routes:** The frontend auth forms will submit data to Next.js Server Actions (or Route Handlers).
- **Backend Communication:** These Next.js server functions will communicate with the NestJS backend API using the `AUTH_ENDPOINTS` and `USER_ENDPOINTS`.
- **Token Management:** Upon successful login/registration, the backend will return a JWT. The Next.js server will store this JWT securely in a cookie using `cookies().set({ httpOnly: true, secure: true })`.
- **Bearer Token Injection:** We will create a server-side fetch wrapper that automatically retrieves the token from the cookies and injects it into the `Authorization: Bearer <token>` header for all private backend requests.

---

## 5. Global Auth Context

To prevent repeating data fetching operations across the app and make user data accessible globally:

- **Server Data Fetching:** We will fetch the data via the `CURRENT_USER` endpoint during the server-side rendering phase in `layout.tsx` (or a dedicated layout).
- **Auth Provider Context:** Create an `AuthContext.tsx` (using React Context) or leverage a Zustand store. The server will pass the fetched user data initial state to this provider.
- **Client-Side Hook:** Create a `useAuth()` hook. Any client component can easily access user details, authentication status, and auth methods (like `logout`) without redundant API calls.

---

## 6. Required Pages & Screens

Based on an analysis of `c:\Projects\Sanad\frontend\app\[local]\(auth)` and the `AUTH_ENDPOINTS`, the following pages need to be implemented or linked.

### Currently Existing:
- `signin/page.tsx` — Needs to be connected to the new Server Actions for login.
- `signup/page.tsx` — Needs to be connected to the new Server Actions for `CREATE_USER`/registration.
- **Forgot Password Screen (`/forgot-password`)** — Interface to request reset link.
- **Reset Password Screen (`/reset-password`)** — Interface to choose new password.
- **Verify Email Screen (`/verify-email`)** — Interface to handle email verification link.

### Missing Pages to Create:
- **Google OAuth Callback (`/api/auth/callback/google`):** A Next.js API route to catch the redirect from Google (via the `GOOGLE_LOGIN`/`GOOGLE_CALLBACK` flow), store the auth token in Next.js cookies, and redirect the user back to the application.

---

## 7. Step-by-Step Implementation Outline

1. **Utility & Session Setup:**
   - Create a `lib/session.ts` wrapper to safely manage the token in Next.js cookies.
   - Implement `lib/api-client.ts` to intercept requests and append the Bearer Token automatically.

2. **Implement Server Actions:**
   - Create `app/actions/authActions.ts` containing functions for `login`, `register`, `logout`, and `getCurrentUser`.

3. **Build the Auth Context:**
   - Develop `app/context/AuthContext.tsx` and a `useAuth()` custom hook.
   - Initialize the context in the root layout with server-fetched user context.

4. **Develop Missing UI Screens:**
   - Create the views for Forgot Password, Reset Password, and Email Verification.

5. **Wire Components:**
   - Link existing Input/Form components in `signin` and `signup` screens to the Server Actions.
   - Add proper loading states and error toast notifications.
   - **Navbar User Button:** Create a `UserButton` component in the navbar for authenticated users. The dropdown must include `Profile`, `Payments`, and `Logout` options. When logging out, a modern loading state/loader must be displayed to the user.

---

## 8. Security Considerations

| Feature | Details |
|---------|---------|
| **Password Hashing** | Argon2 (industry-standard, memory-hard) |
| **Token Type** | JWT signed with HS256 |
| **Token Storage** | Blacklist-based logout (tokens stored in DB) |
| **Email Verification** | Required before login; token expires in 1 hour |
| **Password Reset Token** | Argon2-hashed; expires in 1 hour |
| **Rate Limiting** | Applied on password reset endpoints to prevent abuse |
| **Cookie Flags** | `httpOnly: true`, `secure: true`, `sameSite: 'strict'` |
| **Google OAuth** | Auto-verifies email for Google users |
