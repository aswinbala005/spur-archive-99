import { desc } from "drizzle-orm";
import { db } from "../db";
import { messages, sessions } from "../db/schema";

async function verify() {
  console.log("🔍 Verifying Database State...");

  // Check Sessions
  const allSessions = await db.select().from(sessions);
  console.log(`\n📂 Sessions Count: ${allSessions.length}`);
  allSessions.forEach((s) => {
    console.log(` - ${s.id} (Created: ${s.createdAt})`);
  });

  // Check Messages
  const allMessages = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(10);
  console.log(`\n💬 Recent Messages (Last 10):`);
  allMessages.forEach((m) => {
    console.log(` [${m.role}] ${m.content.substring(0, 50)}...`);
  });

  process.exit(0);
}

verify().catch(console.error);
