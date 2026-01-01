# API Routes

Fastify route definitions. These files should be **THIN**. They should only:
1.  Validate Inputs (JSON Schema).
2.  Call a Service.
3.  Return a Response.

## Files

### `chat.ts`
-   **Endpoints**:
    ```http
    POST /chat
    GET /chat/messages
    ```
-   **Middlewares**: Uses `arcjet` for bot protection and `rate-limit` for DDoS prevention.

### `hooks.ts` (if applicable)
-   **Endpoints**:
    ```http
    POST /hooks/persist
    ```
-   **Role**: Async webhook from QStash to save chat history.
