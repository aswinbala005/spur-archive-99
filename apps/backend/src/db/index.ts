import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

dotenv.config();

// Create a connection pool to Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export the initialized Drizzle client
export const db = drizzle(pool, { schema });
