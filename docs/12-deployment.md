# 14. Deployment & Operations Strategy

**Role**: How to ship code to production and keep it alive.
**Status**: Passive Scaling (Serverless).

---

## 🏗️ 1. Architecture: The "Split Stack"

We do not run a single server. We use specialized providers for each domain.

| Component | Provider | Why? |
| :--- | :--- | :--- |
| **Backend** | **Render** | Native Docker support (needed for `transformers.js` + Node 20). Cheaper/Faster than Heroku. |
| **Frontend** | **Vercel** | Best-in-class SvelteKit edge caching and CD. |
| **Database** | **Neon** | Serverless Postgres. Scales to zero. |
| **Queue** | **Upstash** | Serverless Redis/QStash. Zero maintenance. |

---

## 🚀 2. Backend Deployment (Render)

The Backend is containerized.
*   **Source**: [apps/backend/Dockerfile](../apps/backend/Dockerfile)
*   **Build**: Multi-stage lightweight build (`node:20-alpine`).

### Environment Variables
*See [apps/backend/src/config/config.md](../apps/backend/src/config/config.md) for keys.*

You must set these in Render Dashboard:
1.  `DATABASE_URL`: Connection string from Neon ("Pooled" version).
2.  `GROQ_API_KEY`: For LLM.
3.  `APP_URL`: The public `https://...onrender.com` URL (Vital for Webhook callbacks).

### Health Checks
Render hits `/health` every 10 seconds.
*   **Failing**: If Neon or Redis is down, we return 500.
*   **Zero Downtime**: Render waits for `/health` to return 200 before switching traffic to the new deploy.

---

## ⚡ 3. Frontend Deployment (Vercel)

The Storefront is a static/SSR hybrid.

### Proxy Configuration
To avoid CORS issues and keep the API hidden, Vercel proxies requests to Render.
*   *Config*: [apps/frontend/vercel.json](../apps/frontend/vercel.json)
*   **Rule**: `/api/*` -> `https://spur-archive-backend.onrender.com/*`

### CI/CD Pipeline
1.  Push to `main`.
2.  Vercel detects `apps/frontend` change.
3.  Builds `vite build`.
4.  Deploys to global Edge Network.

---

## 💾 4. Database Operations (Neon)

### Schema Migrations
We do **not** run migrations on app startup (too risky).
**Workflow**:
1.  Dev changes `schema.ts`.
2.  Run `pnpm db:push` locally.
3.  Push Code.
4.  Backend deploys with new Types that match the DB.

### Pooling
Neon provides a generic URL `postgres://` (Session Mode) and a pooled URL `postgres://...-pooler` (Transaction Mode).
*   **Critical**: We use the **Pooled URL** in Production to handle 1000s of concurrent ephemeral connections from Serverless/Docker instances.

---

## 🚦 5. Post-Deployment Checklist

1.  **Smoke Test**: Visit the URL. Type "Hi".
    *   *Success*: "Thinking..." -> Response.
2.  **Async Check**: Send a message, wait 1 second. Refresh page.
    *   *Success*: Message persists (Proof that QStash -> Webhook worked).
3.  **Logs**: Check Render Logging for `Started server on 3000`.
