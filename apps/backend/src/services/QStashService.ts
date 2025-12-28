import { Client } from "@upstash/qstash";
import { config } from "../config/env";

// Initialize the QStash client
// This handles the secure communication with the Upstash Queue
export const qstash = new Client({
  token: config.QSTASH_TOKEN,
});
