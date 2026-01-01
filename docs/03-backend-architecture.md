# 03. Backend Architecture: The Decision Engine

**Role**: The central logic core of Archive 99.
**Dependency**: [02-system-architecture.md](./02-system-architecture.md)
**Status**: Production Ready (Node.js v20).

---

## 🏗️ 1. Core Philosophy: "The Hybrid Brain"

The backend is not just a CRUD API. It is an **Orchestration Engine**.
It routes user intent between two disparate systems:
1.  **Deterministic Tools** (Postgres/SQL): For questions requiring 100% accuracy ("Is this in stock?").
2.  **Probabilistic Inference** (LLM/RAG): For questions requiring semantic understanding ("What fits like this?").

### Why this Architecture?
*   **Separation of Concerns**: The LLM never touches the DB directly. It calls "Tools" (API functions) which sanitize and execute trusted code.
*   **Latency Management**: We split the request into **Synchronous** (Chat Response) and **Asynchronous** (History Persistence) paths to keep the UI snappy (<200ms).

---

## 🛠️ 2. Technology Stack & Rationale

| Layer | Tech | Why we chose it? |
| :--- | :--- | :--- |
| **Server** | **Fastify v5** | 4x faster than Express. Built-in JSON Schema validation (via TypeBox/Zod) prevents invalid data from ever reaching our logic. |
| **Language** | **TypeScript 5** | Strict mode is enabled. We do not allow `any`. If it's not typed, it doesn't ship. |
| **AI SDK** | **Vercel AI SDK Core** | Vendor-agnostic. We currently use Groq, but can switch to OpenAI/Anthropic by changing 1 line. |
| **Database** | **Neon (Postgres)** | Serverless scaling. Matches our "bursty" traffic model (Product Drops). |
| **ORM** | **Drizzle** | "If you know SQL, you know Drizzle". It's lightweight and zero-overhead compared to Prisma. |
| **Queue** | **Upstash QStash** | Serverless Webhooks. Handles reliable delivery of chat history without managing a Redis server. |

---

## 🧱 3. Domain Layers Structure
*Review detailed code docs: [apps/backend/backend.md](../apps/backend/backend.md)*

We strictly enforce a **Unidirectional Data Flow**:

### Level 1: Interface Layer (`src/routes`)
*   **Role**: Traffic Control.
*   **Duties**:
    *   Validate Inputs (Zod Schemas).
    *   Check Security (Arcjet Bot Shield).
    *   Rate Limiting (Redis).
    *   **Rule**: NO Business Logic here.
*   *Docs: [routes.md](../apps/backend/src/routes/routes.md)*

### Level 2: Service Layer (`src/services`)
*   **Role**: The Application Logic.
*   **Duties**:
    *   **`LLMService`**: The Orchestrator. Main loop that talks to Groq.
    *   **`InventoryService`**: The "Hands". Executes SQL for stock checks.
    *   **`RAGService`**: The "Memory". Vector search for policies.
*   *Docs: [services.md](../apps/backend/src/services/services.md)*

### Level 3: Data Layer (`src/db`)
*   **Role**: The Source of Truth.
*   **Duties**:
    *   Schema definitions (`schema.ts`).
    *   Connection Pooling (`index.ts`).
*   *Docs: [db.md](../apps/backend/src/db/db.md)*

---

## 🧠 4. Deep Logic Breakdown

### A. The "Tool Calling" Loop
1.  **User**: *"Do you have the Akira Tee?"*
2.  **LLMService**: Feeds prompt to Llama 3 with tool definitions (`checkStock`, `getPolicy`).
3.  **Llama 3**: Detects intent. Returns `ToolCallJson` { name: "checkStock", args: { query: "Akira" } }.
4.  **Backend**: Intercepts this JSON.
5.  **InventoryService**: Runs `SELECT * FROM products...`.
6.  **Backend**: Feeds result `Found: 1 Item` back to Llama 3.
7.  **Llama 3**: Generates final text: *"Yes, we have one left."*

### B. The "Async Persistence" Loop
1.  Chat response is sent to user immediately.
2.  Backend calls `QStash.publish()`.
3.  QStash waits (milliseconds).
4.  QStash hits our webhook `/hooks/persist`.
5.  Backend saves message to Postgres.
*   **Why?**: Ensures the user never waits for a DB insertion latency.

---

## 5. Security & Operations
*Review: [13-security.md](./13-security.md)*

1.  **Arcjet Shield**: We use digital fingerprinting to ban bots.
2.  **Rate Limiting**: 10 req/min per IP (Generic) to prevent LLM budget drain.
3.  **Environment**: All secrets are validated by `zod` in `src/config/env.ts`. The app will crash immediately on boot if keys are missing.

---

## 💻 6. Quick Commands

```bash
# Start Dev Server
pnpm --filter backend dev

# Sync DB Schema
pnpm --filter backend db:push

# Build for Production
pnpm --filter backend build
```
