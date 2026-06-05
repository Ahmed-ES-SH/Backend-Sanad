# Payments Integration Plan for Frontend Developers

> **Module:** Payments (Stripe Integration)  
> **Version:** 1.0.0  
> **Last Updated:** 2026-04-08  
> **Status:** Ready for Implementation  

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Payment Flow Architecture](#payment-flow-architecture)
4. [Client Endpoints (User-Facing)](#client-endpoints-user-facing)
5. [Admin Endpoints (Admin Dashboard)](#admin-endpoints-admin-dashboard)
6. [Webhook Information](#webhook-information)
7. [TypeScript Interfaces](#typescript-interfaces)
8. [Error Handling Guide](#error-handling-guide)
9. [Integration Examples](#integration-examples)
10. [Testing Checklist](#testing-checklist)
11. [Common Pitfalls & Solutions](#common-pitfalls--solutions)

---

## Overview

This document provides a comprehensive integration plan for frontend developers implementing the Payments module. The backend uses **Stripe** as the payment gateway and follows a **webhook-driven architecture** where payment status updates happen asynchronously.

### Key Concepts

- **Payment Intent:** A Stripe object that represents an attempt to collect payment
- **Client Secret:** A secure key returned by the backend that must be used with Stripe.js to collect payment details
- **Webhook-Driven Status Updates:** Payment status changes are handled asynchronously via Stripe webhooks
- **Idempotency:** All payment operations use idempotency keys to prevent duplicate charges

### Base URL

```
https://your-api-domain.com/api
```

Replace with your environment-specific URL.

---

## Authentication & Authorization

### Client Endpoints

All client endpoints require authentication with a valid `Bearer` token.

```
Authorization: Bearer <user_token>
```

**Required Role:** Any authenticated user (no specific role required)

### Admin Endpoints

All admin endpoints require authentication with an `ADMIN` role.

```
Authorization: Bearer <admin_token>
```

**Required Role:** `ADMIN`

### Unauthorized Responses

If authentication fails, endpoints return:
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not ADMIN role for admin endpoints)

---

## Payment Flow Architecture

### Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                            │
│  1. User clicks "Pay Now"                                           │
│     ↓                                                                │
│  2. Call POST /payments/create-intent                               │
│     ↓                                                                │
│  3. Receive clientSecret from response                              │
│     ↓                                                                │
│  4. Use Stripe.js with clientSecret to collect payment details      │
│     ↓                                                                │
│  5. Display payment form (Stripe Elements)                          │
│     ↓                                                                │
│  6. Call stripe.confirmCardPayment(clientSecret, {...})             │
│     ↓                                                                │
│  7. Stripe processes payment securely                               │
│     ↓                                                                │
│  8. Poll or listen for status update (webhook-driven)               │
│     ↓                                                                │
│  9. Show success/failure message to user                            │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND                                                             │
│  POST /payments/create-intent                                       │
│     ↓                                                                │
│  Create Stripe PaymentIntent                                        │
│     ↓                                                                │
│  Return clientSecret to frontend                                    │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STRIPE                                                              │
│  Process payment with card details                                  │
│     ↓                                                                │
│  Send webhook to POST /api/stripe/webhook                          │
│     ↓                                                                │
│  Backend updates payment status                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Payment Statuses

| Status      | Value       | Description                           | Frontend Action                          |
| ----------- | ----------- | ------------------------------------- | ---------------------------------------- |
| `pending`   | `pending`   | Payment intent created, not confirmed | Show "Processing..." state               |
| `succeeded` | `succeeded` | Payment completed successfully        | Show success message, grant access       |
| `failed`    | `failed`    | Payment attempt failed                | Show error, ask user to retry            |
| `refunded`  | `refunded`  | Payment was refunded                  | Show refund confirmation (admin only)    |

---

## Client Endpoints (User-Facing)

### POST `/payments/create-intent`

**Purpose:** Create a Stripe PaymentIntent and receive a `clientSecret` for use with Stripe.js.

**Authentication:** Required (any authenticated user)

**Request:**

```http
POST /payments/create-intent
Content-Type: application/json
Authorization: Bearer <user_token>
```

**Request Body:**

```typescript
{
  amount: number;         // Required. Amount in dollars (NOT cents). Min: 0.50. Max 2 decimal places.
  currency?: string;      // Optional. ISO 4217 code. Default: "usd". Max 10 chars.
  description: string;    // Required. Description of the payment.
  userId?: string;        // Optional. User UUID to associate with payment.
}
```

**Example Request:**

```json
{
  "amount": 50.00,
  "currency": "usd",
  "description": "Web Development Consultation"
}
```

**Success Response (201 Created):**

```json
{
  "clientSecret": "pi_3N5xYz2eZvKYlo2C0bXcQpRt_secret_xxxxxxxxxxxxxxxxxxxxxxxx",
  "paymentId": "550e8400-e29b-41d4-a716-446655440000",
  "stripePaymentIntentId": "pi_3N5xYz2eZvKYlo2C0bXcQpRt"
}
```

**Response Fields:**

| Field                   | Type     | Description                                              |
| ----------------------- | -------- | -------------------------------------------------------- |
| `clientSecret`          | `string` | Stripe client secret for use with Stripe.js              |
| `paymentId`             | `string` | Internal payment record UUID (for reference)             |
| `stripePaymentIntentId` | `string` | Stripe PaymentIntent ID (for reference)                  |

**Error Responses:**

| Status | Description                                    | Example Response Body                                |
| ------ | ---------------------------------------------- | ---------------------------------------------------- |
| `400`  | Invalid input                                  | `{ "message": "amount must be at least 0.50" }`      |
| `401`  | Unauthorized                                   | `{ "message": "Unauthorized" }`                      |
| `502`  | Stripe API error                               | `{ "message": "Stripe API error" }`                  |

---

## Admin Endpoints (Admin Dashboard)

### GET `/admin/payments`

**Purpose:** List all payments with filters and pagination.

**Authentication:** Required (ADMIN role)

**Request:**

```http
GET /admin/payments?page=1&limit=10&status=succeeded&startDate=2026-01-01
Authorization: Bearer <admin_token>
```

**Query Parameters:**

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

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "stripePaymentIntentId": "pi_3N5xYz2eZvKYlo2C0bXcQpRt",
      "stripeCustomerId": "cus_O1aB2cD3eF4gH5",
      "amount": 50.00,
      "currency": "usd",
      "status": "succeeded",
      "description": "Web Development Consultation",
      "metadata": null,
      "createdAt": "2026-04-01T12:00:00.000Z",
      "updatedAt": "2026-04-01T12:05:00.000Z"
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

**Error Responses:**

| Status | Description                                    |
| ------ | ---------------------------------------------- |
| `401`  | Unauthorized                                   |
| `403`  | Forbidden (not ADMIN role)                     |

---

### GET `/admin/payments/:id`

**Purpose:** Get detailed information about a specific payment.

**Authentication:** Required (ADMIN role)

**Request:**

```http
GET /admin/payments/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <admin_token>
```

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Payment UUID |

**Success Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "stripePaymentIntentId": "pi_3N5xYz2eZvKYlo2C0bXcQpRt",
  "stripeCustomerId": "cus_O1aB2cD3eF4gH5",
  "amount": 50.00,
  "currency": "usd",
  "status": "succeeded",
  "description": "Web Development Consultation",
  "metadata": {
    "orderId": "order-123",
    "customerId": "customer-456"
  },
  "createdAt": "2026-04-01T12:00:00.000Z",
  "updatedAt": "2026-04-01T12:05:00.000Z"
}
```

**Error Responses:**

| Status | Description                                    |
| ------ | ---------------------------------------------- |
| `401`  | Unauthorized                                   |
| `403`  | Forbidden (not ADMIN role)                     |
| `404`  | Payment not found                              |

---

### POST `/admin/payments/:id/refund`

**Purpose:** Refund a payment that has status `succeeded`.

**Authentication:** Required (ADMIN role)

**Request:**

```http
POST /admin/payments/550e8400-e29b-41d4-a716-446655440000/refund
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| `id`      | `string` | Payment UUID |

**Request Body:** None required

**Success Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "refunded",
  "message": "Payment refunded successfully"
}
```

**Error Responses:**

| Status | Description                                                    |
| ------ | -------------------------------------------------------------- |
| `400`  | Payment cannot be refunded (status is not `succeeded`)         |
| `401`  | Unauthorized                                                   |
| `403`  | Forbidden (not ADMIN role)                                     |
| `404`  | Payment not found                                              |
| `502`  | Stripe API error during refund (payment status remains unchanged) |

---

## Webhook Information

### POST `/api/stripe/webhook`

> **Note:** This endpoint is called by Stripe, NOT by the frontend. Information provided here is for understanding the payment flow.

**Purpose:** Receive asynchronous Stripe webhook events and update payment statuses.

**Handled Events:**

| Event                         | Action                                    |
| ----------------------------- | ----------------------------------------- |
| `payment_intent.succeeded`    | Updates payment status to `SUCCEEDED`     |
| `payment_intent.payment_failed` | Updates payment status to `FAILED`      |
| `charge.refunded`             | Updates payment status to `REFUNDED`      |

**Frontend Impact:**

- After calling `stripe.confirmCardPayment()`, the payment status updates asynchronously
- Frontend may need to poll or use WebSocket to receive real-time status updates
- Do not assume payment is complete immediately after Stripe.js returns success

---

## TypeScript Interfaces

### Request DTOs

```typescript
interface CreatePaymentIntentDto {
  amount: number;         // Required. Min: 0.50. Max 2 decimal places.
  currency?: string;      // Optional. Default: "usd". Max 10 chars.
  description: string;    // Required.
  userId?: string;        // Optional. UUID format.
}
```

### Response DTOs

```typescript
interface CreatePaymentIntentResponseDto {
  clientSecret: string;           // Stripe client secret
  paymentId: string;              // Internal payment record ID
  stripePaymentIntentId: string;  // Stripe PaymentIntent ID
}

interface PaymentResponseDto {
  id: string;
  userId: string | null;
  stripePaymentIntentId: string;
  stripeCustomerId: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;  // ISO 8601 date
  updatedAt: string;  // ISO 8601 date
}

interface RefundResponseDto {
  id: string;
  status: string;
  message: string;
}

interface PaginatedPaymentsResponse {
  data: PaymentResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Filter DTO

```typescript
interface PaymentFilterDto {
  page?: number;        // Default: 1. Min: 1
  limit?: number;       // Default: 10. Min: 1, Max: 100
  sortBy?: string;      // Default: "createdAt"
  order?: 'ASC' | 'DESC'; // Default: "DESC"
  status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
  userId?: string;
  startDate?: string;   // ISO 8601
  endDate?: string;     // ISO 8601
}
```

---

## Error Handling Guide

### Standard Error Response Format

```json
{
  "message": "Error description",
  "error": "Error type",
  "statusCode": 400
}
```

### Error Code Handling

```typescript
function handlePaymentError(error: any) {
  if (error.status === 400) {
    // Invalid input — show validation errors
    console.error('Validation error:', error.message);
  } else if (error.status === 401) {
    // Unauthorized — redirect to login
    redirectToLogin();
  } else if (error.status === 403) {
    // Forbidden — show permissions error
    showPermissionsError();
  } else if (error.status === 404) {
    // Not found — show not found message
    showNotFound();
  } else if (error.status === 502) {
    // Gateway error — retry or show technical error
    showTechnicalError();
  }
}
```

### Stripe.js Error Handling

```typescript
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'User Name' }
  }
});

if (error) {
  // Handle Stripe.js error
  console.error('Payment failed:', error.message);
  showPaymentFailed(error.message);
} else if (paymentIntent.status === 'succeeded') {
  // Payment successful
  showPaymentSuccess();
}
```

---

## Integration Examples

### React Component Example

```tsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, description, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getUserToken()}`
        },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          description
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const { clientSecret } = await response.json();

      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name: 'Customer Name' }
        }
      });

      if (error) {
        setError(error.message || 'Payment failed');
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={processing || !stripe}>
        {processing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
};

export const PaymentWrapper: React.FC<PaymentFormProps> = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
);
```

### Axios Service Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
  startDate?: string;
  endDate?: string;
}

export const paymentsApi = {
  // Client endpoints
  createPaymentIntent: (data: {
    amount: number;
    currency?: string;
    description: string;
    userId?: string;
  }) => api.post<{
    clientSecret: string;
    paymentId: string;
    stripePaymentIntentId: string;
  }>('/payments/create-intent', data),

  // Admin endpoints
  listPayments: (filters?: PaymentFilters) => 
    api.get<{
      data: PaymentResponseDto[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>('/admin/payments', { params: filters }),

  getPayment: (id: string) => 
    api.get<PaymentResponseDto>(`/admin/payments/${id}`),

  refundPayment: (id: string) => 
    api.post<{ id: string; status: string; message: string }>(`/admin/payments/${id}/refund`)
};
```

### Polling for Payment Status

```typescript
/**
 * Poll for payment status updates after initiating payment.
 * Since status changes are webhook-driven, polling may be needed.
 */
export function pollPaymentStatus(
  paymentId: string,
  callback: (status: 'pending' | 'succeeded' | 'failed' | 'refunded') => void,
  maxAttempts = 10,
  intervalMs = 2000
) {
  let attempts = 0;
  const interval = setInterval(async () => {
    attempts++;
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      if (response.ok) {
        const { status } = await response.json();
        callback(status);
        if (status !== 'pending') {
          clearInterval(interval);
        }
      }
    } catch (error) {
      console.error('Failed to poll payment status:', error);
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
      callback('failed'); // Timeout considered as failure
    }
  }, intervalMs);

  return () => clearInterval(interval); // Return cleanup function
}
```

---

## Testing Checklist

### Client Payment Flow

- [ ] Call `POST /payments/create-intent` with valid data
- [ ] Verify `clientSecret` is received
- [ ] Use Stripe.js to confirm payment with test card
- [ ] Verify success response from Stripe
- [ ] Handle payment failure with test decline card
- [ ] Handle invalid amount (< 0.50)
- [ ] Handle missing description field
- [ ] Verify proper error messages for 400, 401, 502 errors

### Admin Payment Management

- [ ] List payments with default pagination
- [ ] Filter payments by status
- [ ] Filter payments by date range
- [ ] Filter payments by userId
- [ ] Get single payment by ID
- [ ] Verify 404 for non-existent payment
- [ ] Refund a succeeded payment
- [ ] Attempt to refund a non-succeeded payment (should fail with 400)
- [ ] Verify 403 for non-admin users accessing admin endpoints

### Error Scenarios

- [ ] Handle network timeout
- [ ] Handle invalid authentication token
- [ ] Handle Stripe.js errors
- [ ] Handle 502 Bad Gateway errors
- [ ] Display user-friendly error messages

### Edge Cases

- [ ] Payment with minimum amount (0.50)
- [ ] Payment with maximum amount
- [ ] Payment with non-USD currency
- [ ] Concurrent payment attempts
- [ ] Network disconnection during payment
- [ ] Browser back/forward during payment flow

---

## Common Pitfalls & Solutions

### Pitfall 1: Using Cents Instead of Dollars

**Problem:** Passing amount in cents (e.g., 5000 for $50.00)

**Solution:** The `amount` field expects dollars, NOT cents. The backend handles conversion.

```typescript
// ❌ WRONG
amount: 5000  // This would be $5,000!

// ✅ CORRECT
amount: 50.00  // This is $50
```

### Pitfall 2: Assuming Immediate Status Update

**Problem:** Expecting payment status to be `succeeded` immediately after `stripe.confirmCardPayment()`

**Solution:** Status updates are webhook-driven and asynchronous. Poll or wait for status change.

```typescript
// ❌ WRONG
const result = await stripe.confirmCardPayment(clientSecret, {...});
if (result.paymentIntent.status === 'succeeded') {
  // This might not be true yet!
}

// ✅ CORRECT
const result = await stripe.confirmCardPayment(clientSecret, {...});
// Start polling for status update
const cleanup = pollPaymentStatus(paymentId, (status) => {
  if (status === 'succeeded') {
    // Now it's actually succeeded
  }
});
```

### Pitfall 3: Missing Authentication Headers

**Problem:** Forgetting to include `Authorization` header

**Solution:** Always include the Bearer token in requests.

```typescript
// ✅ CORRECT
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getUserToken()}`  // Don't forget this!
  },
  body: JSON.stringify({ amount: 50, description: 'Payment' })
});
```

### Pitfall 4: Not Handling All Error Cases

**Problem:** Only handling success case, ignoring errors

**Solution:** Implement comprehensive error handling for all status codes.

```typescript
// ✅ CORRECT
try {
  const response = await api.createPaymentIntent(data);
  handleSuccess(response.data);
} catch (error) {
  if (error.response?.status === 400) {
    handleValidationError(error.response.data);
  } else if (error.response?.status === 401) {
    handleUnauthorized();
  } else if (error.response?.status === 502) {
    handleGatewayError();
  } else {
    handleUnexpectedError();
  }
}
```

### Pitfall 5: Attempting to Refund Non-Succeeded Payments

**Problem:** Trying to refund payments that aren't in `succeeded` status

**Solution:** Check payment status before attempting refund.

```typescript
// ✅ CORRECT
if (payment.status === 'succeeded') {
  await paymentsApi.refundPayment(payment.id);
} else {
  showErrorMessage('Only succeeded payments can be refunded');
}
```

---

## Additional Resources

- [Stripe.js Documentation](https://stripe.com/docs/js)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)
- [Payment Intent API](https://stripe.com/docs/api/payment_intents)
- [NestJS Official Documentation](https://docs.nestjs.com/)

---

## Support

For questions or issues with the Payments API:

1. Check this documentation first
2. Review the backend controller files for implementation details:
   - `src/payments/payments.client.controller.ts` (client endpoints)
   - `src/payments/payments.controller.ts` (admin endpoints)
   - `src/payments/payments.webhook.controller.ts` (webhook handler)
3. Contact the backend development team
