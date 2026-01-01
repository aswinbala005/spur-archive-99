# 15. Trade-offs & Architectural Decisions

**Role**: Intellectual Honesty.
**Status**: Critical analysis of the system's limitations.

Every architectural choice is a bet. Here are the bets we made for Archive 99.

---

## 🏛️ 1. The Monolith vs. Microservices

### Decision: **Modular Monolith**
We chose to build a single Fastify application (`apps/backend`) containing all services (`LLM`, `Inventory`, `Auth`).

| Option | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- |
| **Microservices** | Isolation, Independent Scaling. | Network Latency, Distributed Tracing Hell. | ❌ Too complex for V1. |
| **Monolith** | Zero-latency internal calls, Shared Types. | "Spaghetti Code" risk. | ✅ Chosen (with strict domain boundaries). |

*   **Mitigation**: We enforce strict boundaries. `src/routes` cannot import from `src/db`. All comms go through `src/services`.

---

## 💾 2. Vector DB: pgvector vs. Pinecone

### Decision: **pgvector (Integrated)**
We store embeddings in the same Postgres database as our Inventory.

| Aspect | pgvector (Neon) | Pinecone / Weaviate |
| :--- | :--- | :--- |
| **Consistency** | **Atomic**. Rollback transaction = Rollback vectors. | **Eventual**. Vectors might de-sync from Product data. |
| **Cost** | Free (Part of DB). | $70/mo min for decent tiers. |
| **Scale** | Slows down after 1M vectors. | Handles Billions. |

*   **Trade-off**: Query performance is slightly slower (Indices share RAM with tables), but we gain **ACID compliance**. If we delete a product, its embedding is gone instantly. No "Ghost Search Results".

---

## 🔁 3. Embeddings: Local vs. API

### Decision: **Transformers.js (Local)**
We run the `all-MiniLM-L6-v2` model *inside* the Node.js process.

*   **Why Not OpenAI (`text-embedding-3`)?**
    *   **Latency**: Calling OpenAI adds ~200ms round-trip. Local is <10ms.
    *   **Privacy**: We don't send our policy documents to a 3rd party to be indexed.
    *   **Cost**: $0.
*   **The Cost**: High Memory Usage. The Node process requires ~500MB RAM to hold the model.
*   **Mitigation**: We use a `ONNX` quantized version of the model.

---

## 🕵️ 4. Auth: Anonymous vs. OAuth

### Decision: **Anonymous-First (Cookies)**
We track users via a signed `sessionId` cookie. We do not require Login.

*   **The Rationale**: High-end vintage is impulse buying. Forcing a "Sign Up" screen drops conversion by ~30%.
*   **The Risk**: Users lose their chat history if they switch devices.
*   **The Fix (Roadmap)**: Implementing "Link Account" later (merged sessions).

---

## 📉 5. Testing: Speed vs. Certitude

### Decision: **Manual Golden Paths**
We optimized for **Iteration Speed**.

*   **What we skipped**: Unit tests for the AI Responses.
*   **Why**: Prompt engineering changes hourly. Unit tests would break 100x a day.
*   **The Better Way**: **Evals** (LLM-as-a-Judge). We verify the *output quality* rather than the *code paths*.

---

## 🔮 Summary: The "If I had more time" List

1.  **Observability**: I would add **OpenTelemetry** to trace the exact latency of `Groq` vs `Neon` vs `Transformers.js`.
2.  **Streaming**: Currently, RAG retrieval blocks the first token. I would pipeline the retrieval so the AI starts "thinking" out loud while the DB query runs.
3.  **Mobile App**: SvelteKit PWA is good, but a Native App (React Native) would allow Push Notifications for Drops.
