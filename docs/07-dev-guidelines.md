# 09. Developer Guidelines

## 1. Folder Structure
We use a **Monorepo** structure managed by `pnpm workspaces`.

```text
spur-archive-99/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── arcjet.ts    # Bot protection rules
│   │   │   │   └── env.ts       # Environment variable validation
│   │   │   ├── db/
│   │   │   │   ├── schema.ts    # Drizzle ORM definitions
│   │   │   │   └── index.ts     # DB Connection logic
│   │   │   ├── routes/
│   │   │   │   └── chat.ts      # Main Chat API endpoints
│   │   │   ├── scripts/
│   │   │   │   └── seed.ts      # Database seeding script
│   │   │   ├── services/
│   │   │   │   ├── InventoryService.ts # SQL logic
│   │   │   │   ├── LLMService.ts       # OpenAI/Tool logic
│   │   │   │   └── RAGService.ts       # Vector Search logic
│   │   │   └── app.ts           # Fastify entry point
│   │   ├── Dockerfile           # Production container config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── lib/
│       │   │   ├── components/
│       │   │   │   └── ui/      # ShadCN UI components (Button, Card...)
│       │   │   ├── widget/
│       │   │   │   ├── ChatWindow.svelte  # Main widget container
│       │   │   │   ├── ChatBubble.svelte  # Individual message
│       │   │   │   └── ChatInput.svelte   # Text area & send button
│       │   │   └── utils.ts
│       │   ├── routes/
│       │   │   ├── +layout.svelte # Main site wrapper
│       │   │   ├── +page.svelte   # Homepage
│       │   │   └── app.css        # Tailwind/Design tokens
│       ├── package.json
│       ├── svelte.config.js
│       ├── tailwind.config.js
│       └── vercel.json          # Deployment config
│
├── docs/                        # Project Documentation
├── packages/
│   └── tsconfig/                # Shared TypeScript configs
├── scripts/
├── .dockerignore
├── .gitignore
├── package.json                 # Monorepo root scripts
├── pnpm-workspace.yaml          # Workspace definitions
├── README.md
└── setup.sh                     # Automated setup script
```

## 2. Coding Standards

### 🛡️ General Principles

**Language**
We use **TypeScript 5.0+** with strict mode enabled.
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

**Linter & Formatter**
We use **Biome** (`@biomejs/biome`) as a unified toolchain.
```bash
# Check for linting errors and apply safe fixes
pnpm check --apply

# Format all files
pnpm format
```

### 🏗️ Tech Stack & Domains

#### 1. Backend Domain (`apps/backend`)
*The robust API Gateway and Decision Engine.*

**Technology**
-   **Framework**: Fastify v5
-   **Runtime**: Node.js v20 (Alpine Linux in Docker)
-   **Validation**: TypeBox / Zod

**Layers with Examples**

1.  **Interface Layer (`src/routes/`)**
    *No business logic allowed. Only validation and service calls.*
    ```typescript
    // src/routes/chat.ts
    fastify.post("/chat", async (req, reply) => {
      const { message } = req.body; // Validated by Schema
      const response = await LLMService.generateChat(message);
      return { response };
    });
    ```

2.  **Service Layer (`src/services/`)**
    *Pure business logic. Database calls go here.*
    ```typescript
    // src/services/LLMService.ts
    export class LLMService {
      static async generateChat(prompt: string) {
        // Complex logic, tool calling, etc.
        return "AI Response";
      }
    }
    ```

3.  **Data Layer (`src/db/`)**
    *Raw SQL execution via Drizzle ORM.*
    ```typescript
    // src/db/index.ts
    const result = await db.select().from(products).where(eq(products.id, 1));
    ```

#### 2. Frontend Domain (`apps/frontend`)
*The premium, "Old Money" aesthetic storefront.*

**Technology**
-   **Framework**: SvelteKit (Svelte 5)
-   **Styling**: Tailwind CSS + ShadCN
-   **State**: Svelte Runes

**Layers with Examples**

1.  **Page Layer (`src/routes/`)**
    *Layouts and Composition.*
    ```svelte
    <!-- src/routes/+page.svelte -->
    <script>
      import ChatWidget from "$lib/widget/ChatWidget.svelte";
    </script>
    <ChatWidget />
    ```

2.  **Widget Layer (`src/lib/widget/`)**
    *Complex feature logic.*
    ```svelte
    <!-- src/lib/widget/ChatWindow.svelte -->
    <script>
      let messages = $state([]); // Svelte 5 Rune
      
      async function send() {
        // Fetch API logic
      }
    </script>
    ```

3.  **Component Layer (`src/lib/components/`)**
    *Pure UI atoms.*
    ```svelte
    <!-- src/lib/components/ui/button.svelte -->
    <button class="bg-primary text-primary-foreground ...">
      {@render children()}
    </button>
    ```

#### 3. Intelligence Domain (`src/services/LLMService.ts`)
*The "Hybrid Brain" orchestrating the user experience.*

**Technology**
-   **SDK**: Vercel AI SDK Core (`@ai-sdk/*`)
-   **Model**: Llama-3-70b-8192 (via Groq)
-   **RAG**: Transformers.js (`all-MiniLM-L6-v2`)

**Prompt Engineering**
System prompts must be treated as code.
```typescript
// System Prompt Example
const SYSTEM_PROMPT = `
  You are Aria, a Senior Archivist.
  You MUST check inventory with 'checkStock' before promising items.
  Refuse to answer questions about politics.
`;
```

#### 4. Data Domain (`src/db/`)
*The Source of Truth.*

**Technology**
-   **Database**: Neon Serverless Postgres
-   **ORM**: Drizzle Object Relational Mapper
-   **Vector**: pgvector extension

**Schema Definition**
```typescript
// src/db/schema.ts
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  measurements: jsonb("measurements"), // Flexible JSON
  stock: integer("stock").notNull(),
});
```

**Commands**
```bash
# Push schema changes to Neon
pnpm db:push

# Open Database Studio GUI
pnpm db:studio
```
