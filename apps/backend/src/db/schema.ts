import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

// 1. SESSIONS: Tracks anonymous users (linked via Cookie ID)
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(), // The Session ID from the Cookie
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. MESSAGES: The chat history
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id")
    .references(() => sessions.id)
    .notNull(),
  role: text("role", { enum: ["user", "ai"] }).notNull(),
  content: text("content").notNull(),
  // Feedback score: 1 = Thumbs Up, -1 = Thumbs Down (Optional)
  feedbackScore: integer("feedback_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. PRODUCTS: Inventory for "Archive 99"
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(), // e.g., 'akira-tee-1998'
  stock: integer("stock").notNull().default(0),
  isFinalSale: boolean("is_final_sale").default(false),
  // Flexible JSON for vintage measurements (e.g., { pit_to_pit: "22in" })
  measurements: jsonb("measurements"),
  gender: text("gender").notNull().default("Unisex"),
  color: text("color").notNull().default("Multi"),
  brand: text("brand").notNull().default("Vintage"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. DOCUMENTS: The Knowledge Base (RAG)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(), // The Policy text
  // 384 dimensions matches the 'all-MiniLM-L6-v2' model we use in EmbeddingService
  embedding: vector("embedding", { dimensions: 384 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
