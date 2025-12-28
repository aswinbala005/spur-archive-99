import { Type } from "@sinclair/typebox";
import { and, desc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "../db";
import { messages } from "../db/schema";

const FeedbackSchema = Type.Object({
  messageId: Type.Optional(Type.String()), // meaningful if we tracked message IDs in FE
  sessionId: Type.String(),
  feedback: Type.Union([Type.Literal("up"), Type.Literal("down")]),
});

const feedbackRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/feedback",
    {
      schema: {
        body: FeedbackSchema,
      },
    },
    async (req, reply) => {
      const { feedback, sessionId } = req.body as {
        feedback: "up" | "down";
        sessionId: string;
      };
      const score = feedback === "up" ? 1 : -1;

      req.log.info(
        `👍 Feedback received: ${feedback} (${score}) for session ${sessionId}`,
      );

      try {
        // 1. Find the most recent AI message for this session
        const latestAiMessage = await db.query.messages.findFirst({
          where: and(
            eq(messages.sessionId, sessionId),
            eq(messages.role, "ai"),
          ),
          orderBy: [desc(messages.createdAt)],
        });

        if (latestAiMessage) {
          // 2. Update the score
          await db
            .update(messages)
            .set({ feedbackScore: score })
            .where(eq(messages.id, latestAiMessage.id));

          req.log.info(
            `✅ Updated message ${latestAiMessage.id} with score ${score}`,
          );
          return { success: true };
        } else {
          req.log.warn("⚠️ No AI message found to rate for this session.");
          return reply.status(404).send({ error: "Message not found" });
        }
      } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Database update failed" });
      }
    },
  );
};

export default feedbackRoutes;
