import { describe, expect, it, vi } from "vitest";

// Fix: Use vi.hoisted to ensure mock is accessible in factory
const { mockRedis } = vi.hoisted(() => ({
  mockRedis: {
    incr: vi.fn(),
    expire: vi.fn(),
  },
}));

// Mock ioredis as a class because it's instantiated with 'new'
vi.mock("ioredis", () => ({
  default: class Redis {
    constructor() {
      // biome-ignore lint/correctness/noConstructorReturn: intentional mock behavior
      return mockRedis;
    }
  },
}));

import { RateLimitService } from "./RateLimitService";

describe("RateLimitService", () => {
  describe("checkRateLimit", () => {
    it("should allow first request from a session", async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const result = await RateLimitService.checkRateLimit("test-session-1");

      expect(result).toBe(true);
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it("should deny requests when rate limit is exceeded", async () => {
      // Simulate 21st request (over the 20 limit)
      mockRedis.incr.mockResolvedValue(21);

      const result = await RateLimitService.checkRateLimit("test-session-spam");

      expect(result).toBe(false);
    });

    it("should set expiry only on first request", async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      await RateLimitService.checkRateLimit("new-session");

      expect(mockRedis.expire).toHaveBeenCalledWith(
        expect.stringContaining("rate_limit:"),
        60,
      );
    });
  });
});
