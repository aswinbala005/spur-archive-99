# Maintenance Scripts (`src/scripts`)

**Role**: Operational Tooling.
**Status**: Idempotent Automation.

---

## 🛠️ 1. The Seeding Pipeline
One command sets up the entire "Hybrid Brain".

### `seed.ts`
*   **Command**: `pnpm seed`
*   **Source**: [`src/scripts/seed.ts`](./seed.ts)
*   **Logic Flow**:

    1.  **Wipe (Nuclear Option)**:
        *   Runs `DELETE FROM documents; DELETE FROM products;`.
        *   *Why?* Ensures we never have duplicate vector embeddings for the same text.

    2.  **Load AI Model (In-Process)**:
        *   Initializes `Xenova/all-MiniLM-L6-v2` via `transformers.js`.
        *   Takes ~2 seconds to load WASM into memory.

    3.  **Vectorize Knowledge Base**:
        *   Iterates through the Hardcoded Policy Array (Shipping, Returns, Grading).
        *   Generates 384-dimensional float arrays for each policy.
        *   Inserts into `documents` table.

    4.  **Seed Inventory**:
        *   Inserts SKU data (Stock, Price, Measurements) into `products` table.

---

## 📜 2. Package.json Commands

These are the shortcuts defined in `apps/backend/package.json`.

| Command | underlying Script | Purpose |
| :--- | :--- | :--- |
| `pnpm seed` | `tsx src/scripts/seed.ts` | **Reset & Fill**. Run this after `db:push`. |
| `pnpm db:push` | `drizzle-kit push` | **Schema Sync**. Updates Neon to match `schema.ts`. |
| `pnpm db:studio` | `drizzle-kit studio` | **GUI**. Opens a local web interface to browse Drizzle data. |

---

## 🏗️ 3. Why Local Seeding?
We do **not** use an API (like OpenAI) for seeding embeddings.
*   **Cost**: $0.
*   **Privacy**: Our policies never leave our machine.
*   **Consistency**: The same model (`all-MiniLM-L6-v2`) runs in Production (Render) and Dev (MacBook), guaranteeing that vector math works identically everywhere.
