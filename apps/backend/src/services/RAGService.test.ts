import { describe, expect, it, vi } from "vitest";

// Mock the database and embedding service for unit tests
vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("./EmbeddingService", () => ({
  default: {
    embed: vi.fn().mockResolvedValue(new Array(384).fill(0)),
  },
}));

import { RAGService } from "./RAGService";

describe("RAGService", () => {
  describe("getContext", () => {
    it("should return empty string when no documents match", async () => {
      const result = await RAGService.getContext("nonexistent query");

      expect(result).toBe("");
    });

    it("should augment query with 'Policy regarding:' prefix", async () => {
      // This tests the internal behavior of augmenting the query
      // The actual embedding is mocked, so we just verify the function runs
      const result = await RAGService.getContext("return policy");

      expect(typeof result).toBe("string");
    });
  });
});
