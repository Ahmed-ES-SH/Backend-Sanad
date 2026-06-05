# FINAL Stripe Integration (Frontend)

## Scope
This document describes how the frontend should integrate with the current backend Stripe flow.

- Current backend payment flow: **PaymentIntent-based custom flow**
- Recommended for new features: **Checkout Sessions / Payment Element-first**

## Required Backend Endpoints

### 1) Create Payment Intent
- **Method**: `POST`
- **URL**: `/payments/create-intent`
- **Auth**: required (cookie-based auth)
- **Body**:
```json
{
  "amount": 50.0,
  "currency": "usd",
  "description": "Service Order: ...",
  "userId": 123
}
```
- **Success (201)**:
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentId": "uuid",
  "stripePaymentIntentId": "pi_..."
}
```

### 2) Webhook (Backend-only)
- **Method**: `POST`
- **URL**: `/api/stripe/webhook`
- Called by Stripe only. Frontend must **not** call this endpoint.

### 3) Optional status polling
- **Method**: `GET`
- **URL**: `/admin/payments/:id` (admin only)
- For user-facing status, consume your app’s user-order/payment endpoints (if available) or use websocket/events.

## Frontend Payment Flow (Current)

1. Call `POST /payments/create-intent`.
2. Use returned `clientSecret` with Stripe.js confirmation on frontend.
3. Show pending state immediately after confirmation attempt.
4. Wait for backend webhook processing to finalize status.
5. Refresh payment/order status via polling or realtime channel.

## Payment Status Values
Frontend should support these statuses:
- `pending`
- `succeeded`
- `failed`
- `partially_refunded`
- `refunded`

## UX Rules
- `pending`: show "Payment processing".
- `succeeded`: show success confirmation.
- `failed`: show retry action.
- `partially_refunded`: show refunded amount and remaining settled amount.
- `refunded`: show fully refunded state.

## Important Notes
- Webhook is source of truth for final payment state.
- Do not mark payment final based only on client confirmation result.
- Do not expose Stripe secret keys in frontend.
- Use publishable key only on frontend.

## Error Handling
- `400`: validation/user input issue.
- `401`: auth missing/expired.
- `502`: Stripe/backend gateway issue; show retry message.

## Recommended Next Iteration
For new checkout experiences, prefer migrating frontend flow to Checkout Sessions / Payment Element-backed Checkout Sessions to align with Stripe best-practice direction.
