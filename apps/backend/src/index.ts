import cors from "@fastify/cors";
import helmet from "@fastify/helmet"; // <-- 1. Import this
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import { config } from "./config/env";
import sessionPlugin from "./plugins/session";
import chatRoutes from "./routes/chat";
import feedbackRoutes from "./routes/feedback";
import hookRoutes from "./routes/hooks";
import productRoutes from "./routes/products";

const app = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

async function main() {
  // 1. Register Security Headers (Helmet) - DO THIS FIRST
  await app.register(helmet, {
    global: true,
    // We need to relax CSP slightly for Swagger UI to work in dev
    contentSecurityPolicy:
      config.NODE_ENV === "development" ? false : undefined,
  });

  // 2. Register CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // 3. Register Swagger
  await app.register(swagger, {
    openapi: {
      info: { title: "Archive 99 API", version: "1.0.0" },
    },
  });
  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // 4. Register Session Plugin
  await app.register(sessionPlugin);

  // 5. Register Routes
  await app.register(chatRoutes);
  await app.register(hookRoutes);
  await app.register(productRoutes);
  await app.register(feedbackRoutes);

  // 6. Health Check
  app.get("/health", async () => {
    return { status: "ok", uptime: process.uptime() };
  });

  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${config.PORT}`);
    console.log(`📚 Docs available at http://localhost:${config.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
