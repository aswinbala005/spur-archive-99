import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { db } from "../db";
import { documents } from "../db/schema";
import EmbeddingService from "./EmbeddingService";

export const RAGService = {
  /**
   * Retrieves relevant policy documents from the database based on a user query.
   * Uses vector similarity search (cosine distance).
   */
  async getContext(query: string) {
    // Augment the query to improve retrieval accuracy for policy questions
    const augmentedQuery = `Policy regarding: ${query}`;

    // 1. Generate Embedding
    const vector = await EmbeddingService.embed(augmentedQuery);

    // 2. Calculate Similarity (1 - Distance)
    const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, vector)})`;

    // 3. Query DB
    const results = await db
      .select({
        content: documents.content,
        similarity,
      })
      .from(documents)
      // Only return highly relevant matches (> 50%)
      .where(gt(similarity, 0.5))
      .orderBy(desc(similarity))
      .limit(3);

    if (results.length === 0) return "";

    return results.map((r) => r.content).join("\n\n");
  },
};
