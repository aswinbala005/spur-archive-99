# 06. API Specification

**Role**: The contract between Frontend and Backend.
**Tech**: Fastify v5 (Zod Schema Validation).
**Status**: Production V1.

---

## 🏗️ 1. Core Principles

1.  **Strict Validation**: Every request body is validated against a Zod Schema. Invalid data returns `400 Bad Request` instantly (Arcjet saves compute).
2.  **Stateless Auth**: We use `HttpOnly` Signed Cookies for session tracking. No JWTs.
3.  **Bot Protection**: All public endpoints are shielded by **Arcjet**.

### Code Reference
*   **Routes**: [apps/backend/src/routes/routes.md](../apps/backend/src/routes/routes.md)
*   **Schemas**: Defined inline in route files using `@fastify/type-provider-zod`.

---

## 🔌 2. Public Endpoints

### `POST /chat`
The main interaction point for Aria.

*   **Auth**: Anonymous (Session Cookie).
*   **Rate Limit**: 10 requests / 60s per IP.
*   **Logic**:
    1.  Validates `message` string (max 500 chars).
    2.  Calls `LLMService`.
    3.  Returns streamed or buffered text.

**Request**:
```json
{
  "message": "Do you have the Akira tee?",
  "sessionId": "uuid-v4"
}
```

**Response (200 OK)**:
```json
{
  "role": "assistant",
  "content": "Yes, we have one left in size L.",
  "metadata": {
      "toolUsed": "checkStock",
      "latency": 1200
  }
}
```

### `GET /chat/messages`
Hydrates the chat history when the user refreshes the page.

*   **Query**: `?sessionId=uuid-v4`
*   **Logic**: Fetches last 50 messages from Neon DB.

**Response (200 OK)**:
```json
[
  { "role": "user", "content": "Hi" },
  { "role": "assistant", "content": "Welcome to Archive 99." }
]
```

### `GET /products`
The Catalog feed.

*   **Query**: `?sort=newest&limit=20`
*   **Logic**: Simple `SELECT` from `products` table. Used for the [`/products`](../apps/frontend/src/routes/pages.md) page.

---

## 🪝 3. Webhooks & Internal API

### `POST /hooks/persist`
**Role**: Asynchronous Write Worker.
**Caller**: Upstash QStash (Never the Frontend).

*   **Security**: Validates `Upstash-Signature` header.
*   **Why?**: To unblock the main `/chat` response. The LLM replies instantly; the DB write happens here 100ms later.

**Payload**:
```json
{
  "sessionId": "uuid",
  "messages": [ ... ]
}
```

---

## 🚫 4. Error Codes

| Code | Meaning | Reason |
| :--- | :--- | :--- |
| **400** | Bad Request | Zod Validation Failed (e.g. `message` too long). |
| **401** | Unauthorized | Invalid/Missing Session Cookie. |
| **429** | Too Many Requests | Rate Limit Exceeded (Redis). |
| **403** | Forbidden | Arcjet detected a Bot/Scraper. |
| **500** | Internal Error | LLM Provider (Groq) Timeout or DB Connection lost. |
