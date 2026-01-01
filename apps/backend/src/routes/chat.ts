import arcjet, { detectBot, shield } from "@arcjet/node";
import { type Static, Type } from "@sinclair/typebox";
import {
  ConsecutiveBreaker,
  circuitBreaker,
  ExponentialBackoff,
  handleAll,
  retry,
  wrap,
} from "cockatiel";
import { asc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { config } from "../config/env";
import { db } from "../db";
import { messages as messagesTable } from "../db/schema";
import { LLMService } from "../services/LLMService";
import { qstash } from "../services/QStashService";
import { RateLimitService } from "../services/RateLimitService";

// 1. Define the strict schema for incoming requests
// We validate that messages is an array and limit string length to 1000 chars.
const ChatBodySchema = Type.Object({
  messages: Type.Array(
    Type.Object({
      role: Type.Union([Type.Literal("user"), Type.Literal("assistant")]),
      content: Type.String({ maxLength: 1000, minLength: 1 }),
    }),
  ),
});

// Derive a TypeScript type from the schema for type safety
type ChatBodyType = Static<typeof ChatBodySchema>;

// 2. Initialize the Arcjet security shield
const aj = arcjet({
  key: config.ARCJET_KEY,
  characteristics: ["ip.src"], // Identify users by IP address
  rules: [
    // Block automated bots (but allow search engines)
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // Protect against common attacks like SQLi, XSS, etc.
    shield({ mode: "LIVE" }),
  ],
});

const chatRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /chat/messages - Retrieve conversation history
  fastify.get("/chat/messages", async (req, reply) => {
    const sessionId = req.session.id;
    if (!sessionId) {
      return reply.send([]);
    }

    try {
      const history = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.sessionId, sessionId))
        .orderBy(asc(messagesTable.createdAt));

      // Map to UI format
      const uiMessages = history.map((msg) => ({
        id: msg.id,
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.content,
        feedback: msg.feedbackScore, // 1 for up, -1 for down, null for none
      }));

      return reply.send(uiMessages);
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({ error: "Failed to fetch history" });
    }
  });

  // POST /chat/reset - Start a new session
  fastify.post("/chat/reset", async (_req, reply) => {
    reply.clearCookie("sessionId", { path: "/" });
    return reply.send({ success: true });
  });

  fastify.post(
    "/chat",
    {
      schema: {
        body: ChatBodySchema,
      },
    },
    async (req, reply) => {
      // 3. Explicitly cast the body to our defined type
      const { messages } = req.body as ChatBodyType;
      const sessionId = req.session.id;

      // 🛡️ SECURITY LAYER 1: ARCJET (Smart Defense)
      // Skip bot detection in development mode for easier testing
      if (config.NODE_ENV !== "development") {
        const decision = await aj.protect(req);
        if (decision.isDenied()) {
          req.log.warn(`Arcjet Blocked Request: ${decision.reason.type}`);
          if (decision.reason.isBot()) {
            return reply.status(403).send({ error: "No bots allowed." });
          }
          return reply
            .status(403)
            .send({ error: "Request rejected by security shield." });
        }
      }

      // 🛡️ SECURITY LAYER 2: REDIS (Rate Limiting)
      const isAllowed = await RateLimitService.checkRateLimit(sessionId);
      if (!isAllowed) {
        return reply
          .status(429)
          .send({ error: "Too many messages. Please wait a minute." });
      }

      req.log.info(`💬 Chat request from Session: ${sessionId}`);

      try {
        // Sanitize messages to only include role and content
        const sanitizedMessages = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Resilience Policy (Circuit Breaker + Retry)
        // Retry 3 times with exponential backoff
        // If 3 consecutive failures occur, open circuit for 10 seconds
        const retryPolicy = retry(handleAll, {
          maxAttempts: 3,
          backoff: new ExponentialBackoff(),
        });

        const breakerPolicy = circuitBreaker(handleAll, {
          halfOpenAfter: 10 * 1000,
          breaker: new ConsecutiveBreaker(3),
        });

        // Wrap them: Retry ( Outer ) -> Breaker ( Inner )
        const resilience = wrap(retryPolicy, breakerPolicy);

        // 4. Call the Brain (LLM Service) with Resilience
        const result = await resilience.execute(() =>
          LLMService.generateChat({
            history: sanitizedMessages,
            onCompletion: async (completion) => {
              // Async Persistence Callback
              // 1. DEVELOPMENT: Simulate QStash logic
              if (config.NODE_ENV === "development") {
                console.log("🔄 DEV MODE: Simulating QStash delivery...");
                fetch(`http://localhost:${config.PORT || 3000}/hooks/persist`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sessionId,
                    userMessage:
                      sanitizedMessages[sanitizedMessages.length - 1]
                        ?.content ?? "",
                    aiMessage: completion,
                  }),
                }).catch((err) =>
                  console.error("❌ Dev Persistence Failed:", err),
                );
                return;
              }

              // 2. PRODUCTION: Real QStash Publish
              try {
                await qstash.publishJSON({
                  url: `${config.APP_URL}/hooks/persist`,
                  body: {
                    sessionId,
                    userMessage:
                      sanitizedMessages[sanitizedMessages.length - 1]
                        ?.content ?? "",
                    aiMessage: completion,
                  },
                });
              } catch (err) {
                console.error("QStash publish failed:", err);
              }
            },
          }),
        );

        // 5. Return the AI's synthesized response
        const finalText =
          result.text || "I couldn't generate a response. Please try again.";
        console.log(
          "✅ Sending response:",
          `${finalText.substring(0, 100)}...`,
        );

        reply.type("text/plain");
        return reply.send(finalText);
      } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: "AI Service Unavailable" });
      }
    },
  );
};

export default chatRoutes;
