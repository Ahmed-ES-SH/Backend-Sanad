# Payments API Documentation

> For frontend developers integrating with the Payments module (Stripe).

**Base URL:** `/api` (adjust based on your environment)  
**Authentication:** Client endpoints require authenticated `Bearer` token. Admin endpoints require `ADMIN` role.

---

## Table of Contents

- [Data Model](#data-model)
- [Payment Statuses](#payment-statuses)
- [Client Endpoints](#client-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Webhook](#webhook)
- [DTOs](#dtos)
- [Error Responses](#error-responses)
- [Notes for Frontend](#notes-for-frontend)

---

## Data Model

### Payment Entity

| Field                   | Type                  | Required | Description                               |
| ----------------------- | --------------------- | -------- | ----------------------------------------- |
| `id`                    | `string`              | auto     | UUID, primary key                         |
| `userId`                | `string`              | no       | Associated user UUID                      |
| `stripePaymentIntentId` | `string`              | auto     | Stripe PaymentIntent ID                   |
| `stripeCustomerId`      | `string`              | no       | Stripe Customer ID                        |
| `amount`                | `number`              | yes      | Amount in dollars (e.g. `50.00`)          |
| `currency`              | `string`              | yes      | ISO 4217 code (default: `usd`)            |
| `status`                | `PaymentStatus`       | auto     | See [Payment Statuses](#payment-statuses) |
| `description`           | `string`              | yes      | Payment description                       |
| `metadata`              | `Record<string, any>` | no       | Additional data (JSONB)                   |
| `createdAt`             | `Date`                | auto     | Creation timestamp                        |
| `updatedAt`             | `Date`                | auto     | Last update timestamp                     |

---

## Payment Statuses

| Status      | Value       | Description                           |
| ----------- | ----------- | ------------------------------------- |
| `PENDING`   | `pending`   | Payment intent created, not confirmed |
| `SUCCEEDED` | `succeeded` | Payment completed successfully        |
| `FAILED`    | `failed`    | Payment attempt failed                |
| `REFUNDED`  | `refunded`  | Payment was refunded                  |

---

## Client Endpoints

Authenticated users (any role) can create payment intents.

### POST `/payments/create-intent`

Create a Stripe PaymentIntent. Returns a `clientSecret` to be used with Stripe.js on the frontend.

**Authentication:** Required (any authenticated user)

**Request Body** (`CreatePaymentIntentDto`):

| Field         | Type     | Required | Description                                         |
| ------------- | -------- | -------- | --------------------------------------------------- |
| `amount`      | `number` | yes      | Amount in dollars, min `0.50`, max 2 decimal places |
| `currency`    | `string` | no       | ISO 4217 code (default: `usd`, max 10 chars)        |
| `description` | `string` | yes      | Description of the payment                          |
| `userId`      | `string` | no       | User UUID to associate with payment                 |

**Example Request:**

```json
{
  "amount": 50.0,
  "currency": "usd",
  "description": "Web Development Consultation"
}
```

**Response:**

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentId": "uuid-here",
  "stripePaymentIntentId": "pi_xxx"
}
```

**Status:** `201 Created`

**Frontend Flow:**

1. Call this endpoint to get `clientSecret`
2. Use `clientSecret` with Stripe.js (`stripe.confirmCardPayment`) to collect payment
3. Stripe will send the result to the backend webhook automatically

---

## Admin Endpoints

All endpoints under `/admin/payments` require **ADMIN** role authentication.

### GET `/admin/payments`

List all payments with filters and pagination.

**Query Parameters** (`PaymentFilterDto` extends `PaginationQueryDto`):

| Parameter   | Type     | Default     | Description                                                    |
| ----------- | -------- | ----------- | -------------------------------------------------------------- |
| `page`      | `number` | `1`         | Page number (min: 1)                                           |
| `limit`     | `number` | `10`        | Items per page (1–100)                                         |
| `sortBy`    | `string` | `createdAt` | Sort field                                                     |
| `order`     | `string` | `DESC`      | `ASC` or `DESC`                                                |
| `status`    | `string` | —           | Filter by status: `pending`, `succeeded`, `failed`, `refunded` |
| `userId`    | `string` | —           | Filter by user UUID                                            |
| `startDate` | `string` | —           | Filter from date (ISO 8601, e.g. `2026-01-01`)                 |
| `endDate`   | `string` | —           | Filter until date (ISO 8601, e.g. `2026-12-31`)                |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "stripePaymentIntentId": "pi_xxx",
      "stripeCustomerId": "cus_xxx",
      "amount": 50.0,
      "currency": "usd",
      "status": "succeeded",
      "description": "Web Development Consultation",
      "metadata": null,
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### GET `/admin/payments/:id`

Get a single payment by ID.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Payment UUID |

**Response:** `PaymentResponseDto` object.

**Status Codes:**

- `200` — Payment found
- `404` — Payment not found

---

### POST `/admin/payments/:id/refund`

Refund a succeeded payment.

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Payment UUID |

**Response:**

```json
{
  "id": "uuid",
  "status": "refunded",
  "message": "Payment refunded successfully"
}
```

**Constraints:**

- Only payments with status `succeeded` can be refunded → `400 Bad Request` otherwise
- If Stripe refund fails, returns `502 Bad Gateway` and payment status remains unchanged

**Status Codes:**

- `200` — Refund successful
- `400` — Payment cannot be refunded (not in `succeeded` status)
- `404` — Payment not found
- `502` — Payment gateway error during refund

---

## Webhook

### POST `/api/stripe/webhook`

Receives Stripe webhook events. This endpoint is called by Stripe, **not** by the frontend.

**Authentication:** None (public, but requires valid Stripe signature)

**Handled Events:**

- `payment_intent.succeeded` — Updates payment status to `SUCCEEDED`
- `payment_intent.payment_failed` — Updates payment status to `FAILED`
- `charge.refunded` — Updates payment status to `REFUNDED`

**Response:**

```json
{
  "received": true
}
```

**Note:** Requires `rawBody` to be available on the request. The module configures middleware to capture the raw body for signature verification.

---

## DTOs

### CreatePaymentIntentDto

```typescript
interface CreatePaymentIntentDto {
  amount: number; // required, min 0.50, max 2 decimals
  currency?: string; // optional, default "usd", max 10 chars
  description: string; // required
  userId?: string; // optional, UUID
}
```

### CreatePaymentIntentResponseDto

```typescript
interface CreatePaymentIntentResponseDto {
  clientSecret: string; // Stripe client secret
  paymentId: string; // Internal payment record ID
  stripePaymentIntentId: string; // Stripe PaymentIntent ID
}
```

### PaymentResponseDto

```typescript
interface PaymentResponseDto {
  id: string;
  userId: string | null;
  stripePaymentIntentId: string;
  stripeCustomerId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### RefundResponseDto

```typescript
interface RefundResponseDto {
  id: string;
  status: string;
  message: string;
}
```

### PaymentFilterDto

```typescript
interface PaymentFilterDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  status?: PaymentStatus;
  userId?: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}
```

---

## Error Responses

| Status | Description                                    |
| ------ | ---------------------------------------------- |
| `400`  | Bad Request — invalid input, invalid signature |
| `401`  | Unauthorized — missing or invalid token        |
| `403`  | Forbidden — insufficient permissions           |
| `404`  | Not Found — payment does not exist             |
| `502`  | Bad Gateway — Stripe API error                 |

---

## Notes for Frontend

1. **Payment flow:**
   - Call `POST /payments/create-intent` to get a `clientSecret`
   - Use Stripe.js with the `clientSecret` to collect payment details from the user
   - Stripe confirms the payment and sends a webhook to the backend
   - The backend updates the payment status automatically

2. **Amount in dollars:** The `amount` field is in dollars (e.g. `50.00`), NOT cents. The backend converts to cents for Stripe.

3. **Currency:** Defaults to `usd` if not specified. Must be a valid ISO 4217 currency code.

4. **Status updates are webhook-driven:** Payment status changes happen asynchronously via Stripe webhooks. After confirming a payment with Stripe.js, you may need to poll or wait for the status to update.

5. **Refunds are admin-only:** Only admin users can trigger refunds via `POST /admin/payments/:id/refund`. Only `succeeded` payments can be refunded.

6. **Idempotency:** Both payment intent creation and refunds use idempotency keys to prevent duplicate charges/refunds.

7. **Metadata:** The `metadata` field stores additional data from Stripe (e.g. `refundId`, `refundedAt`, `adminRefundedAt`). Use it for audit trails.
