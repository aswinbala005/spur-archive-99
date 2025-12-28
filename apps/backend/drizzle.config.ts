import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env variables for the CLI
dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: Required for CLI execution
    url: process.env.DATABASE_URL!,
  },
});
