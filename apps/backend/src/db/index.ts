import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config/env"; // Use validated config
import * as schema from "./schema";

// Create a connection pool to Postgres using the validated URL
const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

// Export the initialized Drizzle client
// This 'db' object is used throughout the app to perform queries
export const db = drizzle(pool, { schema });
