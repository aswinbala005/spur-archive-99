import { pipeline } from "@huggingface/transformers";
import { db } from "../db";
import { documents, products } from "../db/schema";

async function seed() {
  console.log("🌱 Starting Seed for Archive 99...");

  // 1. Initialize the Embedding Model (Local)
  console.log("🔮 Loading Embedding Model (Xenova/all-MiniLM-L6-v2)...");
  const generateEmbedding = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
  );

  // Helper to convert text to vector
  const embed = async (text: string) => {
    const output = await generateEmbedding(text, {
      pooling: "mean",
      normalize: true,
    });
    return Array.from(output.data) as number[];
  };

  // --- A. KNOWLEDGE BASE (RAG) ---
  const policies = [
    {
      content:
        "Archive 99 Policy: All Sales Are Final. Due to the vintage nature of our items, we do not accept returns or exchanges under any circumstances. Please check measurements carefully before buying.",
    },
    {
      content:
        "Condition Grading: 'Deadstock' means brand new with tags. 'Grade A' is gently used. 'Grade B' means distressed (fading, pinholes, small stains). We consider Grade B flaws to be 'character' and do not discount for them.",
    },
    {
      content:
        "Sizing Guide: Vintage clothing runs smaller than modern sizing. A 1990s 'Large' fits like a modern 'Medium'. Always compare the 'Pit-to-Pit' measurements listed on the product page to your own clothes.",
    },
    {
      content:
        "Authentication: Every item is verified by our in-house experts. We check stitch counts, tag years, and print texture. We offer a lifetime money-back guarantee on authenticity.",
    },
    {
      content:
        "Shipping: We ship worldwide via DHL Express. Orders over $500 require a signature upon delivery. We are not responsible for customs duties.",
    },
  ];

  console.log("📚 Seeding Policies...");
  for (const policy of policies) {
    const vector = await embed(policy.content);
    await db.insert(documents).values({
      content: policy.content,
      embedding: vector,
    });
  }

  // --- B. INVENTORY (SQL) ---
  const inventory = [
    {
      name: "Vintage 1998 Akira Tee",
      slug: "akira-tee-1998",
      stock: 1,
      isFinalSale: true,
      measurements: {
        pit_to_pit: "22 inches",
        length: "28 inches",
        note: "Fits like Modern Medium",
      },
    },
    {
      name: "Carhartt Detroit Jacket (Moss Green)",
      slug: "carhartt-detroit-moss",
      stock: 0, // SOLD OUT
      isFinalSale: true,
      measurements: { pit_to_pit: "24 inches", length: "26 inches" },
    },
    {
      name: "Helmut Lang Painter Jeans",
      slug: "helmut-lang-painter",
      stock: 2,
      isFinalSale: false,
      measurements: { waist: "32 inches", inseam: "30 inches" },
    },
  ];

  console.log("👕 Seeding Inventory...");
  await db.insert(products).values(inventory);

  console.log("✅ Seeding Complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding Failed:", err);
  process.exit(1);
});
