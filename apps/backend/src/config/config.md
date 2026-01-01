# Backend Configuration (`src/config`)

**Role**: Environment & Security Rules.
**Validation**: Strict Schema (TypeBox).
**Status**: Zero-Trust.

---

## 🔑 1. Environment (`env.ts`)

We do not trust `process.env`.
We use **TypeBox** + **env-schema** to enforce strict typing at startup.

### Why TypeBox?
It compiles to JSON Schema, which is faster than Zod for high-throughput validations (like validating every single API request body).

### The Schema
```typescript
const schema = Type.Object({
  NODE_ENV: Type.String({ default: "development" }),
  DATABASE_URL: Type.String(), // Neon
  GROQ_API_KEY: Type.String(), // AI
  ARCJET_KEY: Type.String(),   // Bot Shield
});
```

*   **Behavior**: If `DATABASE_URL` is missing in `.env`, the app **crashes immediately** with a descriptive error. This prevents runtime `undefined` errors.
*   **Usage**:
    ```typescript
    import { config } from "./config/env";
    console.log(config.GROQ_API_KEY); // Guaranteed to be a string
    ```

---

## 🛡️ 2. Security Config

### Helmet (Headers)
*   **Location**: `src/index.ts`
*   **Role**: Sets `Content-Security-Policy`, `X-Frame-Options`, etc.
*   **Dev Mode**: We disable CSP in development to allow Swagger UI inline scripts.

### CORS (Cross-Origin)
*   **Location**: `src/index.ts`
*   **Policy**: `origin: true` (Reflects request origin) + `credentials: true`.
*   **Goal**: Allows the Frontend (port 5173) to talk to Backend (port 3000) securely with Cookies.

### Arcjet (Bot Defense)
*   **Context**: Code references `ARCJET_KEY`.
*   **Role**: Analyzing request fingerprints to detect automated scrapers/attackers.
*   *(Note: Implementation details are in route-level guards).*

---

## 🍪 3. Constants

### Cookie Secret
*   **Key**: `COOKIE_SECRET` (32+ chars).
*   **Algorithm**: HMAC-SHA256.
*   **Rotation**: Currently manual (changing ENV invalidates all active sessions).

### Rates
*   **Redis**: `REDIS_URL` defaults to `localhost:6379`.
*   **Limits**: 10 req/min for Chat endpoints.
