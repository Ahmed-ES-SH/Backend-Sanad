# Contact API Documentation

> For frontend developers integrating with the Contact module.

**Base URL:** `/api` (adjust based on your environment)  
**Authentication:** Submit endpoint is public. Management endpoints require `ADMIN` role.

---

## Table of Contents

- [Data Model](#data-model)
- [Public Endpoints](#public-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [DTOs](#dtos)
- [Error Responses](#error-responses)
- [Notes for Frontend](#notes-for-frontend)

---

## Data Model

### ContactMessage Entity

| Field       | Type      | Required | Description                      |
| ----------- | --------- | -------- | -------------------------------- |
| `id`        | `string`  | auto     | UUID, primary key                |
| `fullName`  | `string`  | yes      | Max 100 chars                    |
| `email`     | `string`  | yes      | Max 255 chars, valid email       |
| `subject`   | `string`  | yes      | Max 200 chars                    |
| `message`   | `string`  | yes      | Message content (text)           |
| `isRead`    | `boolean` | auto     | Defaults to `false`              |
| `repliedAt` | `Date`    | no       | Timestamp when marked as replied |
| `ipAddress` | `string`  | auto     | Sender's IP (captured on submit) |
| `createdAt` | `Date`    | auto     | Submission timestamp             |
| `updatedAt` | `Date`    | auto     | Last update timestamp            |

---

## Public Endpoints

### POST `/contact`

Submit a contact form message. No authentication required.

**Rate Limit:** Max 5 submissions per hour per IP.

**Request Body** (`CreateContactMessageDto`):

| Field      | Type     | Required | Description          |
| ---------- | -------- | -------- | -------------------- |
| `fullName` | `string` | yes      | Max 100 chars        |
| `email`    | `string` | yes      | Valid email, max 255 |
| `subject`  | `string` | yes      | Max 200 chars        |
| `message`  | `string` | yes      | Message content      |

**Example Request:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a potential project..."
}
```

**Response:**

```json
{
  "message": "Your message has been sent successfully",
  "id": "uuid-here"
}
```

**Status:** `201 Created`

**Status Codes:**

- `201` — Message submitted
- `400` — Validation error
- `429` — Rate limit exceeded (max 5/hour)

---

## Admin Endpoints

All endpoints under `/admin/contact` require **ADMIN** role authentication.

### GET `/admin/contact`

List all contact messages with pagination and filtering.

**Query Parameters** (`ContactQueryDto` extends `PaginationQueryDto`):

| Parameter | Type      | Default     | Description            |
| --------- | --------- | ----------- | ---------------------- |
| `page`    | `number`  | `1`         | Page number (min: 1)   |
| `limit`   | `number`  | `10`        | Items per page (1–100) |
| `sortBy`  | `string`  | `createdAt` | Sort field             |
| `order`   | `string`  | `DESC`      | `ASC` or `DESC`        |
| `isRead`  | `boolean` | —           | Filter by read status  |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "subject": "Project Inquiry",
      "message": "...",
      "isRead": false,
      "repliedAt": null,
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### GET `/admin/contact/:id`

Get a single contact message by ID.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | Contact message UUID |

**Response:** Single `ContactMessage` object.

**Status Codes:**

- `200` — Message found
- `404` — Message not found

---

### PATCH `/admin/contact/:id/read`

Mark a contact message as read.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | Contact message UUID |

**Response:**

```json
{
  "id": "uuid",
  "isRead": true,
  "message": "Message marked as read"
}
```

**Status Codes:**

- `200` — Marked as read
- `404` — Message not found

---

### PATCH `/admin/contact/:id/reply`

Mark a contact message as replied. Also sets `isRead` to `true`.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | Contact message UUID |

**Response:**

```json
{
  "id": "uuid",
  "isRead": true,
  "repliedAt": "2026-04-01T00:00:00.000Z",
  "message": "Message marked as replied"
}
```

**Status Codes:**

- `200` — Marked as replied
- `404` — Message not found

---

### DELETE `/admin/contact/:id`

Delete a contact message permanently.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | Contact message UUID |

**Response:**

```json
{
  "message": "Contact message deleted successfully"
}
```

**Status Codes:**

- `200` — Deleted successfully
- `404` — Message not found

---

## DTOs

### CreateContactMessageDto

```typescript
interface CreateContactMessageDto {
  fullName: string; // required, max 100
  email: string; // required, valid email, max 255
  subject: string; // required, max 200
  message: string; // required
}
```

### ContactQueryDto

```typescript
interface ContactQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  isRead?: boolean; // filter by read status
}
```

---

## Error Responses

| Status | Description                          |
| ------ | ------------------------------------ |
| `400`  | Bad Request — validation error       |
| `401`  | Unauthorized — missing/invalid token |
| `403`  | Forbidden — insufficient permissions |
| `404`  | Not Found — message does not exist   |
| `429`  | Too Many Requests — rate limit hit   |

---

## Notes for Frontend

1. **Rate limiting:** The public submit endpoint is rate-limited to 5 submissions per hour per IP address.

2. **IP capture:** The sender's IP address is automatically captured from the request on submit.

3. **No reply content:** The `markAsReplied` endpoint only sets a timestamp — it does not store the reply content. The actual reply should be sent via your email service separately.

4. **Read status:** Marking as replied also automatically marks the message as read.
