import { randomUUID } from "node:crypto";
import cookie from "@fastify/cookie";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { config } from "../config/env";

async function sessionPlugin(fastify: FastifyInstance) {
  // 1. Register Cookie Plugin
  // This parses incoming cookies and adds the sign/unsign methods
  fastify.register(cookie, {
    secret: config.COOKIE_SECRET,
    hook: "onRequest",
  });

  // 2. Global Hook: Check or Create Session
  fastify.addHook("onRequest", async (req, reply) => {
    const rawCookie = req.cookies.sessionId;

    // Check if cookie exists and signature is valid
    if (rawCookie) {
      const unsigned = fastify.unsignCookie(rawCookie);
      if (unsigned.valid && unsigned.value) {
        // Valid existing session
        req.session = { id: unsigned.value };
        return;
      }
    }

    // No valid cookie found -> New User: Generate ID
    const newId = randomUUID();

    // Set Secure Cookie
    reply.setCookie("sessionId", newId, {
      path: "/",
      httpOnly: true, // JS cannot read this (Security against XSS)
      secure: config.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "lax",
      signed: true, // HMAC Signed (Tamper-proof)
      maxAge: 60 * 60 * 24 * 30, // 30 Days
    });

    req.session = { id: newId };
  });
}

// Export as a Fastify Plugin
export default fp(sessionPlugin);

// Extend Fastify types to include our custom session object
declare module "fastify" {
  interface FastifyRequest {
    session: { id: string };
  }
}
