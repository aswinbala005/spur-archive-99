import Redis from "ioredis";
import { config } from "../config/env";

// Connect to Local Docker Redis
const redis = new Redis(config.REDIS_URL);

export const RateLimitService = {
  /**
   * Checks if a session has exceeded the rate limit.
   * Limit: 10 requests per 60 seconds.
   */
  async checkRateLimit(sessionId: string): Promise<boolean> {
    const key = `rate_limit:${sessionId}`;

    // Increment the counter for this session
    const currentCount = await redis.incr(key);

    // If this is the first request, set the expiry window to 60 seconds
    if (currentCount === 1) {
      await redis.expire(key, 60);
    }

    // Check if limit exceeded
    if (currentCount > 10) {
      return false; // Blocked
    }

    return true; // Allowed
  },
};
