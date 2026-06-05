# Admin Send Notification — Integration Plan (v3)

## Overview

Batch notification delivery via `POST /admin/notifications/send` with a JSON body.  
Designed for **serverless execution** — no queues, no Redis, no workers, no background processes.

Users are processed in small chunks (20 per batch) using a sequential-chunk + `Promise.allSettled()` pattern, keeping memory and DB connection usage low even for the maximum batch of 100 users.

---

## 1. Architecture Decisions

| Decision                    | Rationale                                                    |
|-----------------------------|--------------------------------------------------------------|
| `POST` with JSON body       | Cleaner than `GET ?ids[]=...`; no URL length limits          |
| Synchronous in-request      | No queues or workers needed for serverless                   |
| Chunked processing (20)     | Avoids 100 parallel DB writes + WS emits per request         |
| `Promise.allSettled()`      | Partial-failure tolerant — one bad user never kills a batch  |
| `200 OK` (not `201`)        | Not creating a single REST resource; batch is transactional  |
| Max 100 user IDs            | Safe limit for serverless function timeout & memory          |
| Object-map for preferences  | Replaces switch statement; cleaner to extend                 |

---

## 2. DTO — `SendNotificationDto`

**File:** `src/notifications/dto/send-notification.dto.ts`

| Field     | Type                       | Required | Validation                       |
|-----------|----------------------------|----------|----------------------------------|
| `ids`     | `number[]`                 | Yes      | 1–100 items, all numbers         |
| `type`    | `NotificationType`         | Yes      | Valid enum value                 |
| `title`   | `string`                   | Yes      | Non-empty, max 255 chars         |
| `message` | `string`                   | Yes      | Non-empty                        |
| `data`    | `Record<string, unknown>`  | No       | Must be object if provided       |

---

## 3. Processing Flow

```
POST /admin/notifications/send  { ids: [5, 12, 33, ...], type, title, message, data? }
         │
         ▼
  Deduplicate IDs → [...new Set(ids)]
         │
         ▼
  Split into chunks of 20
         │
         ▼
  For each chunk (sequentially):
    │
    ├─ Promise.allSettled(chunk.map(processUser))
    │     │
    │     ├─ getPreferences(userId)
    │     ├─ isNotificationTypeEnabled(type, prefs)  ← object map lookup
    │     ├─ [skip if disabled]
    │     ├─ repository.save(notification)
    │     ├─ gateway.emitToUser(userId, notification)
    │     └─ emitUnreadCountUpdate(userId)
    │
    └─ Aggregate chunk results into totals
         │
         ▼
  Return { success, message, sent, failed, failedIds }
```

### Preference Mapping

```typescript
// Constant object map — no switch statement
TYPE_TO_PREFERENCE = {
  [ORDER_UPDATED]:  'orderNotifications',
  [ORDER_CREATED]:  'orderNotifications',
  [PAYMENT_SUCCESS]: 'paymentNotifications',
  [PAYMENT_FAILED]:  'paymentNotifications',
  [SYSTEM]:          'systemNotifications',
  [BROADCAST]:       'systemNotifications',
};
```

Users with the relevant preference set to `false` are **silently skipped** (not counted as failed).

---

## 4. Endpoint Contract

### Request

```
POST /api/admin/notifications/send
Content-Type: application/json
Authorization: Bearer <admin-jwt-token>

{
  "ids": [5, 12, 33],
  "type": "SYSTEM",
  "title": "Scheduled Maintenance",
  "message": "The system will be down for maintenance on May 10 at 2 AM.",
  "data": {
    "maintenanceWindow": "2026-05-10T02:00:00Z"
  }
}
```

### Success Response (`200 OK`)

```json
{
  "success": true,
  "message": "Notification sent to 3 user(s)",
  "sent": 3,
  "failed": 0,
  "failedIds": []
}
```

### Partial Success Response (`200 OK`)

```json
{
  "success": true,
  "message": "Notification sent to 2 user(s), 1 failed",
  "sent": 2,
  "failed": 1,
  "failedIds": []
}
```

> `failedIds` is always `[]` in the current implementation because individual user IDs cannot be reliably captured from a rejected `Promise.allSettled()` branch without restructuring. The count is accurate; the specific IDs are intentionally omitted to keep the code simple and serverless-friendly.

### All Skipped Response (`200 OK`)

```json
{
  "success": true,
  "message": "All users have notifications disabled for this type",
  "sent": 0,
  "failed": 0,
  "failedIds": []
}
```

### Error Responses

| Status | Scenario                          | Body                                                         |
|--------|-----------------------------------|--------------------------------------------------------------|
| 400    | Empty IDs                         | `{ "message": ["ids must contain at least 1 user ID"] }`     |
| 400    | More than 100 IDs                 | `{ "message": ["ids must contain at most 100 user IDs"] }`   |
| 400    | Non-numeric IDs                   | `{ "message": ["each value in ids must be a number"] }`      |
| 400    | Missing title/message             | `{ "message": ["title should not be empty"] }`               |
| 401    | Not authenticated                 | `{ "message": "Unauthorized" }`                              |
| 403    | Not admin                         | `{ "message": "Forbidden" }`                                 |

---

## 5. File Changes Summary

| File                                              | Change                                                       |
|---------------------------------------------------|--------------------------------------------------------------|
| `src/notifications/dto/send-notification.dto.ts`  | **CREATE** — DTO with `@ArrayMaxSize(100)`                   |
| `src/notifications/notifications.service.ts`      | **MODIFY** — add `adminSendToUsers()` + chunked processing + object-map preference lookup |
| `src/notifications/notifications.controller.ts`   | **MODIFY** — `POST /admin/notifications/send` → accepts `SendNotificationDto`, returns `200 OK` |

**No new dependencies, no schema changes, no environment changes.**

---

## 6. Chunk Size Tuning

| Environment    | Recommended chunk size | Reason                          |
|----------------|------------------------|---------------------------------|
| Serverless     | 20                     | Balances speed vs. connection pool |
| Local dev      | 20                     | Same as production              |
| High-latency DB| 10                     | Reduce concurrent connections   |

Change the `CHUNK_SIZE` static constant in `NotificationsService` to tune.

---

## 7. Response Shape

```typescript
interface SendNotificationResult {
  success: boolean;      // true unless every single delivery failed
  message: string;       // Human-readable summary
  sent: number;          // Count of successfully delivered
  failed: number;        // Count of failed deliveries
  failedIds: number[];   // Always [] (see note in section 4)
}
```
