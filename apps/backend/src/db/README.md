# Database Layer (`src/db`)

**Role**: The Source of Truth.
**Provider**: Neon (Postgres).
**ORM**: Drizzle.

---

## 🏗️ 1. Schema Strategy

We use a "Hybrid Schema" that mixes **Relational** (Products), **Document** (JSONB), and **Vector** (Embeddings) data in a single Postgres database.

### Core Tables (`schema.ts`)

| Table | Role | Key Fields |
| :--- | :--- | :--- |
| **`products`** | The Inventory. | `slug` (Unique), `stock` (Int), `measurements` (JSONB). |
| **`documents`** | The Knowledge Base. | `content` (Text), `embedding` (Vector 384). |
| **`sessions`** | Auth Identity. | `id` (UUID from Cookie). |
| **`messages`** | Chat History. | `role` (user/ai), `content`. |

### Why JSONB?
Vintage clothing implies unique sizing.
Instead of a rigid `chest_size` column, we store flexible data in `measurements`:
```json
{
  "pit_to_pit": "22 inches",
  "length": "28 inches",
  "note": "Fits boxy"
}
```
This allows us to add new measurement types without running database migrations.

### Why pgvector?
We store the AI embeddings *directly* in the `documents` table using the `vector(384)` type.
*   **Metric**: Cosine Similarity.
*   **Dimensions**: 384 (Matches `all-MiniLM-L6-v2`).
*   **Benefit**: We can join relational data (e.g. "Only search Enabled documents") in a single SQL query.

---

## 🔌 2. Connection Factory (`index.ts`)

We use `drizzle-orm/node-postgres` with a connection pool.

```typescript
const pool = new Pool({
  connectionString: config.DATABASE_URL
});
export const db = drizzle(pool, { schema });
```

*   **Pooling**: Essential for Serverless environments (Render/Vercel) to prevent "Too Many Connections" errors.

---

## 🛠️ 3. Workflow & Commands

We do **not** use migration files (`001_create_users.sql`) in development. We use "Push".

| Goal | Command | Description |
| :--- | :--- | :--- |
| **Sync Schema** | `pnpm db:push` | Introspects `schema.ts`, compares with Neon, and applies changes instantly. |
| **Reset Data** | `pnpm seed` | Wipes tables and repopulates with `src/scripts/seed.ts`. |
| **Visualize** | `pnpm db:studio` | Opens a local Admin Panel to view/edit rows. |

---

## ⚠️ 4. Critical Rules

1.  **Do NOT edit SQL manually**. Always change `schema.ts` and run `db:push`.
2.  **Vectors must match**. If you change the Embedding Model in `EmbeddingService`, you must run `pnpm seed` to regenerate all vectors. Mismatched dimensions = Crash.
