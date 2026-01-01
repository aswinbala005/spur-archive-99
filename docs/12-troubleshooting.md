# 12. Troubleshooting & Operational Runbook

**Role**: The Emergency Manual for maintaining Archive 99.
**Audience**: DevOps & Developers.

---

## 🔍 1. Diagnostic Decision Matrix

Use this table to map symptoms to the likely failed layer.

| Symptom | Layer | Likely Cause | Fix |
| :--- | :--- | :--- | :--- |
| **"Thinking..." forever** | Backend / LLM | Groq Timeouts or Rate Limit. | Check `LOG_LEVEL=debug` for API errors. |
| **"I cannot answer that"** | Logic / Guardrail | Prompt refusal or Low RAG score. | Tweak System Prompt or Similarity Threshold. |
| **Old Products shown** | Database | Stale Cache or Index. | Run `pnpm seed` to refresh inventory. |
| **History missing** | Async Queue | QStash failure. | Check Upstash DLQ (Dead Letter Queue). |
| **429 Error** | Interface | IP Blocking / Rate Limit. | Flush Redis or wait 60s. |

---

## 🛠️ 2. Detailed Fixes by Domain

### A. Interface Layer (Fastify/Arcjet)
**Issue**: `403 Forbidden` on every request.
*   **Context**: Arcjet thinks you are a bot.
*   **Fix**:
    1.  Check your `ARCJET_KEY`.
    2.  Are you running `curl` in a loop? Arcjet fingerprints CLI tools.
    3.  **Bypass**: Set `ARCJET_ENV=development` in `.env` (Disable shield).

### B. Service Layer (LLM/Groq)
**Issue**: `JSON Parse Error` in logs.
*   **Context**: The LLM output invalid JSON for a Tool Call.
*   **Fix**: Llama-3 is usually good, but smallest models fail.
    *   **Retry**: The UI automatically retries.
    *   **Fallback**: Check if `TOOLS_STRICT_MODE=true` is enabling constrained generation.

### C. Data Layer (Neon/Drizzle)
**Issue**: `Prepared statement "..." already exists` or Connection Errors.
*   **Context**: Serverless cold starts or connection pool exhaustion.
*   **Fix**:
    *   Ensure you are using the `@neondatabase/serverless` driver (HTTP-based), not TCP, for Vercel/Render edge environments.

**Issue**: `Vector dimension mismatch`.
*   **Context**: You changed the embedding model but didn't re-seed.
*   **Fix**:
    1.  `pnpm db:push` (Reset schema).
    2.  `pnpm seed` (Regenerate all 384-dim vectors).

### D. Infrastructure (QStash)
**Issue**: Optimistic UI works, but refresh shows empty chat.
*   **Context**: The "Async Write" failed.
*   **Investigation**:
    1.  Go to Upstash Console > Messages.
    2.  Filter by `Delivered: False`.
    3.  If `401 Unauthorized`: Check `QSTASH_TOKEN`.
    4.  If `500 Error`: Check Backend logs for the `/hooks/persist` endpoint.

---

## 🧪 3. Debugging Toolkit

### Enable Deep Logging
In `.env`:
```bash
# Reveals raw prompts and RAG retrieval scores
LOG_LEVEL=debug
DEBUG=drizzle-orm*
```

### Manual Health Check
Verify the "Hybrid Brain" components independently:

```bash
# 1. Check AI (Is Groq up?)
curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"

# 2. Check DB (Is Neon up?)
pnpm --filter backend db:studio

# 3. Check Queue (Is QStash reachable?)
curl $QSTASH_URL
```

---

## 🚨 4. Emergency Reset

If the state is corrupted (e.g., bad migration, stuck queue):

```bash
# 1. Nuke Database (Schema + Data)
pnpm --filter backend db:push --force

# 2. Clear Rate Limits (Redis)
redis-cli -u $UPSTASH_REDIS_REST_URL FLUSHALL

# 3. Fresh Start
pnpm --filter backend seed
```
