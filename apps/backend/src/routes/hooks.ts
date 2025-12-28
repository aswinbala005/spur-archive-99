import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { db } from "../db";
import { messages, sessions } from "../db/schema";

// Define schema for the webhook payload
const PersistBodySchema = Type.Object({
  sessionId: Type.String(),
  userMessage: Type.String(),
  aiMessage: Type.String(),
});

// Infer TypeScript type from the schema
type PersistBodyType = Static<typeof PersistBodySchema>;

const hookRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/hooks/persist",
    {
      schema: {
        body: PersistBodySchema,
      },
    },
    async (req, reply) => {
      // Safe destructuring with typed body
      const { sessionId, userMessage, aiMessage } = req.body as PersistBodyType;

      try {
        // 1. Ensure Session Exists (Upsert Logic)
        // We attempt to insert the session ID. If it exists, we do nothing.
        // This prevents Foreign Key constraint errors.
        await db
          .insert(sessions)
          .values({ id: sessionId })
          .onConflictDoNothing();

        // 2. Insert Messages
        await db.insert(messages).values([
          { sessionId, role: "user", content: userMessage },
          { sessionId, role: "ai", content: aiMessage },
        ]);

        fastify.log.info(`✅ Persisted chat for session: ${sessionId}`);
      } catch (error) {
        fastify.log.error(
          error,
          `🔥 Failed to persist chat for session: ${sessionId}`,
        );
        // Return 500 so QStash retries later if the DB is down
        return reply.status(500).send({ error: "Failed to persist" });
      }

      return reply.status(200).send({ success: true });
    },
  );
};

export default hookRoutes;
