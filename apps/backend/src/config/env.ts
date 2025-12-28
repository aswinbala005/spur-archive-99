import { type Static, Type } from "@sinclair/typebox";
import envSchema from "env-schema";

const schema = Type.Object({
  NODE_ENV: Type.String({ default: "development" }),
  PORT: Type.Number({ default: 3000 }),
  DATABASE_URL: Type.String(),
  GROQ_API_KEY: Type.String(),
  COOKIE_SECRET: Type.String({ minLength: 32 }),
  REDIS_URL: Type.String({ default: "redis://localhost:6379" }),
  ARCJET_KEY: Type.String(),
  QSTASH_URL: Type.String(),
  QSTASH_TOKEN: Type.String(),
  APP_URL: Type.Optional(Type.String()),
});

export const config = envSchema({
  schema,
  dotenv: true, // Automatically load .env
}) as Static<typeof schema>;
