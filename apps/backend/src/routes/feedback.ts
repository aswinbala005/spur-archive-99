import { Type } from "@sinclair/typebox";
import { and, desc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "../db";
import { messages } from "../db/schema";

const FeedbackSchema = Type.Object({
  messageId: Type.Optional(Type.Integer()), // meaningful if we tracked message IDs in FE
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
      const { feedback, messageId } = req.body as {
        feedback: "up" | "down";
        messageId?: number;
      };
      const sessionId = req.session.id; // Use secure cookie ID
      const score = feedback === "up" ? 1 : -1;

      req.log.info(
        `👍 Feedback received: ${feedback} (${score}) for session ${sessionId} (msg: ${messageId || "latest"})`,
      );

      try {
        let targetMessageId: number | undefined;

        if (messageId) {
          // Validate ownership
          const msg = await db.query.messages.findFirst({
            where: and(
              eq(messages.id, messageId),
              eq(messages.sessionId, sessionId),
              eq(messages.role, "ai"),
            ),
          });
          if (msg) targetMessageId = msg.id;
        }

        if (!targetMessageId) {
          // Fallback: Find the most recent AI message for this session
          const latestAiMessage = await db.query.messages.findFirst({
            where: and(
              eq(messages.sessionId, sessionId),
              eq(messages.role, "ai"),
            ),
            orderBy: [desc(messages.createdAt)],
          });
          if (latestAiMessage) targetMessageId = latestAiMessage.id;
        }

        if (targetMessageId) {
          // 2. Update the score
          await db
            .update(messages)
            .set({ feedbackScore: score })
            .where(eq(messages.id, targetMessageId));

          req.log.info(
            `✅ Updated message ${targetMessageId} with score ${score}`,
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
