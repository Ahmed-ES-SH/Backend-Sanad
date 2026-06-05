# Notifications Module Integration Plan

## 1. Scope

This document defines the integration contract between backend notifications APIs/events and frontend consumers after the April 23, 2026 fixes.

Covered fixes:
- WebSocket connection authentication at handshake time.
- Dedicated event path for broadcast-to-all notifications.
- Real-time unread-count emission on notification mutations.
- Preferences update payload binding from request body.

## 2. REST Contracts

### 2.1 `PATCH /notifications/preferences`

- Authentication: required.
- Request body source: JSON body (`@Body`), not query string.
- DTO: `UpdatePreferencesDto`.
- Response: updated preferences object.

Example request:

```json
{
  "orderNotifications": true,
  "paymentNotifications": true,
  "systemNotifications": false,
  "emailEnabled": true,
  "pushEnabled": true
}
```

## 3. WebSocket Contracts

### 3.1 Connection Auth

Server authenticates at connection lifecycle (`handleConnection`) using token from one of:
- Cookie: `sanad_auth_token`
- `handshake.auth.token`
- Query param: `token`
- `Authorization: Bearer <token>`

Connection is rejected when token is missing, invalid, or blacklisted.

### 3.2 Outbound Events

- `notification:new`
- `notification:read`
- `notification:read_all`
- `notification:delete`
- `notification:count` with payload:

```json
{ "unreadCount": 3 }
```

### 3.3 Unread Count Sync Rules

Backend emits `notification:count` after:
- Notification creation.
- Mark-one-as-read.
- Mark-all-as-read.
- Soft delete.
- Admin targeted broadcast per target user.

### 3.4 Broadcast-to-All Flow

When admin sends broadcast without `targetUserIds`:
- Backend emits `notification.broadcast.all`.
- Handler broadcasts via gateway with `notification:new`.
- Payload type is `BROADCAST`.
- This path does not reuse `notification.order.updated`.

## 4. Integration Validation Checklist

1. Open two browser sessions for same user and connect WebSocket with valid token.
2. Create notification via backend/admin endpoint and verify both receive:
- `notification:new`
- `notification:count` updated value
3. Mark one notification as read from one session and verify other session receives:
- `notification:read`
- `notification:count` updated value
4. Call `PATCH /notifications/read-all` and verify `notification:read_all` + count update.
5. Soft delete notification and verify `notification:delete` + count update.
6. Send admin broadcast with no `targetUserIds`; verify clients receive `notification:new` payload with `type: BROADCAST`.
7. Send `PATCH /notifications/preferences` with JSON body and verify persisted values change correctly.
