# Fastify Plugins (`src/plugins`)

**Role**: Global Middleware & Lifecycle Hooks.
**Architecture**: Decorator Pattern.
**Status**: Scoped Isolation.

---

## 🏗️ Philosophy

In Fastify, "Everything is a Plugin".
However, to keep our architecture clean, we restrict Plugins to **Infrastructure Concerns** only (Cookies, Headers, Error Handling).
Business logic never lives here.

---

## 🍪 1. `session.ts` (Identity Layer)
*   **Role**: Anonymous User Tracking.
*   **Goal**: Assign a stable ID to every visitor without requiring Login.
*   **Tech**: `@fastify/cookie` (Signed).

### Logic Flow (`onRequest` Hook)
1.  **Check Cookie**: Does `req.cookies.sessionId` exist?
2.  **Validate Signature**:
    *   We use HMAC signing with `COOKIE_SECRET` to prevent tampering.
    *   User cannot edit their cookie to spoof another session.
3.  **Hydrate Request**:
    *   If Valid: sets `req.session = { id: ... }`.
    *   If Missing/Invalid:
        1.  Generates `randomUUID()`.
        2.  Sets `Set-Cookie` header (HttpOnly, Secure, SameSite=Lax).
        3.  Sets `req.session`.

### Type Augmentation
This plugin uses TypeScript `declare module` to globally extend the `FastifyRequest` interface, ensuring `req.session.id` is fully typed in all Routes.

---

## 🔌 2. `sensible.ts` (Error Defaults)
*   **Role**: Standardized HTTP Errors.
*   **Tech**: `@fastify/sensible`.
*   **Goal**:
    *   Instead of `reply.code(404).send('Not Found')`...
    *   We validly use `throw fastify.httpErrors.notFound()`.
    *   Fastify automatically formats this as a standard JSON Error Response.
