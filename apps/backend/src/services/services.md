# Service Layer (`src/services`)

**Role**: The "Brain" of the Backend.
**Logic**: Pure, stateless TypeScript classes that orchestrate Data and AI.

---

## 🏗️ Architecture

Services are the **only** layer allowed to:
1.  Import `db` (Data Layer).
2.  Call OpenAI/Groq (AI Layer).
3.  Execute Business Rules (e.g., "Final Sale" checks).

They are invoked by `routes/` and return plain JSON to be sent to the client.

### Cross-References
*   **Data Models**: See [`src/db/db.md`](../db/db.md) for table schemas used here.
*   **Keys & Env**: See [`src/config/config.md`](../config/config.md) for API keys (Groq, Upstash).

---

## 📡 1. `LLMService.ts` (The Orchestrator)
This is the **Router**. It decides *how* to answer.

*   **System Prompt**: Defined in `askAria()`. Sets the "Senior Archivist" persona.
*   **Tool Definitions**:
    *   `checkStock`: "Call this if user asks about inventory."
    *   `getPolicy`: "Call this if user asks about shipping/returns."
*   **Logic**:
    1.  Receives user text.
    2.  Calls Groq (Llama 3 70b).
    3.  If Groq wants to run a tool, LLMService executes it.
    4.  Feeds result back to Groq.
    5.  Returns final natural language response.

---

## 📦 2. `InventoryService.ts` (The Fact Checker)
This is the **Deterministic Tool**.

*   **Goal**: Prevent Hallucinations about stock.
*   **Method**: `checkStock(query)`
*   **Logic**:
    *   Splits query into tokens (e.g. "Helmut Lang" -> `["Helmut", "Lang"]`).
    *   Runs SQL `ILIKE` for fuzzy matching.
    *   Returns **Exact JSON**:
        ```json
        { "stock": 0, "isFinalSale": true, "measurements": { "chest": "22" } }
        ```
    *   *Note*: The LLM reads this JSON to say "Sorry, it's sold out."

---

## 📚 3. `RAGService.ts` (The Librarian)
This is the **Probabilistic Tool**.

*   **Goal**: Answer policy questions ("Do you ship to UK?") accurately.
*   **Method**: `getContext(query)`
*   **Logic**:
    1.  **Embed**: Converts query to 384-dimension vector via `EmbeddingService`.
    2.  **Search**: Runs `cosineDistance` against `documents` table.
    3.  **Filter**: Only assumes truth if `similarity > 0.5`.
    4.  **Inject**: Returns the raw text chunk to the LLM's context window.

---

## 🧠 4. `EmbeddingService.ts` (The Engine)
*   **Role**: Internal utility.
*   **Tech**: `Xenova/transformers`.
*   **Model**: `all-MiniLM-L6-v2` (Quantized ONNX).
*   **Performance**: Runs in-process (Node.js). 10ms inference. Zero API cost.

---

## � 5. `QStashService.ts` (The Carrier)
*   **Role**: Operational reliability.
*   **Tech**: `@upstash/qstash`.
*   **Logic**:
    *   We do not write to the DB immediately during a chat to save latency.
    *   Instead, we `publishJSON` to QStash.
    *   QStash calls our `/hooks` endpoint 1 second later to persist the message.

---

## �🛡️ 6. `RateLimitService.ts`
*   **Role**: Infrastructure Guard.
*   **Tech**: Upstash Redis (via HTTP).
*   **Logic**: Sliding Window Counter.
*   **Rule**: 10 requests / 60 seconds per IP.
