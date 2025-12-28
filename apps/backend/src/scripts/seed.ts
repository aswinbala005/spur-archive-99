import { pipeline } from "@huggingface/transformers";
import { db } from "../db";
import { documents, products } from "../db/schema";

async function seed() {
  console.log("🌱 Starting Seed for Archive 99...");

  // --- 0. WIPE OLD DATA (Makes the script idempotent) ---
  console.log("🧹 Clearing old data from 'documents' and 'products' tables...");
  await db.delete(documents);
  await db.delete(products);
  console.log("✅ Old data cleared.");

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
  const knowledgeBase = [
    // === SECTION 1: DEEP POLICY KNOWLEDGE ===

    // 1. Partial Refunds/Disputes: "The Akira Tee has a small stain..."
    {
      content:
        "Policy on Partial Refunds and Item Condition Disputes: We do not offer partial refunds for any reason. All items are sold 'as-is' and are priced according to their graded condition (e.g., Grade A, B, C). Minor flaws such as pinholes, fading, or small stains on items graded below 'Deadstock' are considered part of the item's vintage character and are not grounds for a refund.",
    },
    // 2. Chargebacks: "I'm going to issue a chargeback..."
    {
      content:
        "Policy on Chargebacks: Our 'All Sales Final' policy is a binding agreement made at the point of sale. In the event of a chargeback, we will provide the financial institution with the customer's agreement to this policy, along with order details and shipping confirmation. Fraudulent chargebacks will be disputed.",
    },
    // 3. Lost/Stolen Packages: "The tracking says 'Delivered' but it's not here."
    {
      content:
        "Policy on Lost or Stolen Packages: Archive 99's responsibility for the package ends once the tracking information is updated to 'Delivered'. We are not liable for packages that are lost or stolen from the customer's property. The customer must file a claim directly with the carrier (DHL) and/or a report with local law enforcement. We can provide shipping details to assist with their claim.",
    },
    // 4. Customs Seizure: "My package is stuck in customs..."
    {
      content:
        "Policy on International Customs and Seizures: The customer is the importer of record and is solely responsible for all customs duties, taxes, and clearance procedures. If a package is held, seized, or requires an import license, the customer must work directly with their country's customs agency. We cannot intervene or provide refunds for items seized by customs.",
    },

    // === SECTION 2: PRODUCT & SOURCING KNOWLEDGE ===

    // 5. Item History/Provenance: "Where did you get this Nirvana tee?"
    {
      content:
        "Sourcing and Provenance Information: We source our items from a private, global network of trusted vintage collectors and archival houses to guarantee authenticity. To protect the privacy and business relationships of our suppliers, we do not disclose the specific history, provenance, or previous owners of individual items.",
    },
    // 6. Care Instructions: "How do I wash a 30-year-old shirt?"
    {
      content:
        "Care Instructions for Vintage Garments: For delicate vintage items, especially printed t-shirts, we strongly recommend a gentle hand-wash in cold water with a mild, pH-neutral detergent. Lay flat or hang to dry. DO NOT use a machine dryer, as the high heat can crack the print and damage the aged fabric.",
    },
    // 7. Future Stock/Requests: "Can you notify me when you get another?"
    {
      content:
        "Policy on Restocks and Item Requests: All items at Archive 99 are '1-of-1' originals. We do not restock items once they are sold. We do not maintain a waitlist or notification system for specific future items. The best way to see new arrivals is to follow our Instagram (@Archive99).",
    },
    // 8. Selling to the Store: "Do you buy from the public?"
    {
      content:
        "Policy on Acquiring Inventory: We do not purchase items from the general public or individual sellers. Our entire inventory is exclusively sourced through our private, vetted network of professional collectors. This is a key part of our authenticity guarantee.",
    },

    // === SECTION 3: BUSINESS & META KNOWLEDGE ===

    // 9. Physical Location: "Do you have a physical store?"
    {
      content:
        "Business Location: Archive 99 is an online-only retailer. We do not have a physical storefront, showroom, or offer in-person pickups. Our operations are based out of a private warehouse facility in Tokyo, Japan, which is not open to the public.",
    },
    // 10. Job Applications: "Are you hiring?"
    {
      content:
        "Career Inquiries: For information on open positions, please visit our official careers page at archive99.com/careers. We do not accept resumes or job applications through this support channel. Any applications sent here will be disregarded.",
    },
    // 11. Press/Media: "I'm a writer for a magazine..."
    {
      content:
        "Press and Collaboration Inquiries: For all press, media, partnership, or influencer inquiries, please direct your communication to our marketing team at press@archive99.com. The customer support team is not equipped to handle these requests.",
    },
    // 12. Data Privacy: "What do you do with my data?"
    {
      content:
        "Data Privacy Policy: We use customer data (name, address, email) exclusively for order processing, shipping, and fraud prevention. We do not sell, rent, or share your personal information with third-party marketers. Our full privacy policy is available at archive99.com/privacy.",
    },

    // === SECTION 4: EDGE CASES & DEFLECTIONS ===

    // 13. Bargaining/Haggling: "I'll give you $700 for the tee."
    {
      content:
        "Policy on Pricing and Haggling: All prices listed on Archive 99 are firm and non-negotiable. Our prices are set based on an item's rarity, condition, and current market value. We do not accept offers, trades, or engage in bargaining.",
    },
    // 14. Legal Threats: "Your policy is illegal..."
    {
      content:
        "Policy on Legal Matters: This AI support agent is not equipped to handle legal inquiries or threats. All legal matters must be directed in writing to our legal department at legal@archive99.com. Our terms of service, agreed to at checkout, govern all transactions.",
    },
    // 15. Competitor Comparison: "Why are you more expensive than eBay?"
    {
      content:
        "Our Value Proposition: Prices on open marketplaces may vary. Archive 99 provides a service that includes a rigorous multi-point authentication guarantee, detailed measurements, and professional condition grading. We sell confidence and verified authenticity, not just clothing.",
    },
    // 16. Unreasonable Demands: "Can you ship it in a special box?"
    {
      content:
        "Policy on Special Requests: To ensure fast and efficient processing for all customers, we cannot accommodate special requests for custom packaging, gift wrapping, or handwritten notes. All orders are shipped in our standard, high-quality, and secure packaging.",
    },

    // == CORE POLICIES ==
    {
      content:
        "Policy: All Sales Are Final. Due to the unique, vintage, and pre-owned nature of our items, we do not accept returns, exchanges, or cancellations under any circumstances. All items are sold 'as-is'. Please review all photos and measurements carefully before purchasing.",
    },
    {
      content:
        "Policy Exception: Authenticity Guarantee. We offer a lifetime, 100% money-back guarantee if an item is proven to be non-authentic by a reputable third-party authenticator. The buyer is responsible for the cost of authentication.",
    },
    {
      content:
        "Policy Exception: Damaged in Transit. If an item is damaged during shipping, the customer must contact us at support@archive99.com within 48 hours of delivery with photos of the packaging and the item. We will then file an insurance claim with the carrier.",
    },

    // == CONDITION & SIZING ==
    {
      content:
        "Condition Grading Guide: 'Deadstock' (10/10) means brand new, unworn, often with original tags. 'Grade A' (8-9/10) is gently used with minimal signs of wear. 'Grade B' (6-7/10) is distressed, showing fading, pinholes, or small stains which are considered part of the item's character. 'Grade C' (4-5/10) is heavily worn, thrashed, with significant flaws.",
    },
    {
      content:
        "Sizing Guide: Vintage clothing from the 80s and 90s runs significantly smaller than modern sizing. A vintage 'Large' often fits like a modern 'Medium'. We provide 'pit-to-pit' and 'length' measurements in inches for all tops. For pants, we provide 'waist' and 'inseam'. Always compare these measurements to your own well-fitting garments.",
    },

    // == AUTHENTICATION & SOURCING ==
    {
      content:
        "Authentication Process: Every item at Archive 99 undergoes a rigorous, multi-point inspection by our in-house experts. We check stitch counts, tag details (era, material), hardware (zippers, buttons), and print texture against our database of authentic examples. We do not sell fakes, ever.",
    },
    {
      content:
        "Sourcing: We source our items from a global network of trusted vintage collectors, private sellers, and archival houses. We do not buy items from the general public.",
    },

    // == SHIPPING & ORDERS ==
    {
      content:
        "Shipping Policy: We ship worldwide from our warehouse in Tokyo, Japan, using DHL Express exclusively. All orders are typically processed and shipped within 2 business days.",
    },
    {
      content:
        "Shipping Costs & Times: Domestic (Japan) shipping is a flat rate of $10. International shipping is a flat rate of $45. International orders typically arrive within 5-7 business days. All orders are fully tracked.",
    },
    {
      content:
        "Signature Requirement: For security and insurance purposes, all orders over $500 require a direct signature upon delivery. The carrier will not leave the package unattended.",
    },
    {
      content:
        "Customs and Duties: International customers are responsible for any and all customs duties, taxes, or import fees levied by their country. Archive 99 does not cover these fees.",
    },

    // == PAYMENTS & TECHNICAL ISSUES ==
    {
      content:
        "Payment Methods: We accept all major credit cards (Visa, MasterCard, American Express) as well as PayPal. We do not accept cryptocurrency, bank transfers, or payment plans.",
    },
    {
      content:
        "Payment Declines: If your payment is declined, please first check with your bank or card issuer. Our system automatically rejects payments if the billing address does not match the one on file with your card.",
    },
    {
      content:
        "Technical Support: If you are experiencing issues with the website, such as a broken page or login problem, please try clearing your browser cache. If the problem persists, email support@archive99.com with a screenshot.",
    },

    // == META & COMPANY INFO ==
    {
      content:
        "About Archive 99: We are a curated marketplace for authentic, high-end vintage 90s streetwear and designer archival pieces. Our mission is to preserve fashion history and provide collectors with verified, rare items.",
    },
    {
      content:
        "How Archive 99 Works: Our team of experts sources and authenticates every item. We grade the condition, take detailed measurements, and list it. All items are '1-of-1', meaning there is only one in stock.",
    },
    {
      content:
        "Contact Information: For complex issues or inquiries not covered here, you can email our human support team at support@archive99.com. We do not offer phone or live chat support with human agents.",
    },
    {
      content:
        "Collaborations & Press: For partnership, influencer, or press inquiries, please contact press@archive99.com. We do not respond to these requests via the support channel.",
    },
  ];

  console.log("📚 Seeding Knowledge Base...");
  for (const doc of knowledgeBase) {
    const vector = await embed(doc.content);
    await db.insert(documents).values({
      content: doc.content,
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
      gender: "Men",
      color: "Faded Black",
      brand: "Vintage",
    },
    {
      name: "Carhartt Detroit Jacket (Moss Green)",
      slug: "carhartt-detroit-moss",
      stock: 0, // SOLD OUT
      isFinalSale: true,
      measurements: { pit_to_pit: "24 inches", length: "26 inches" },
      gender: "Men",
      color: "Moss Green",
      brand: "Carhartt",
    },
    {
      name: "Helmut Lang Painter Jeans",
      slug: "helmut-lang-painter",
      stock: 2,
      isFinalSale: false,
      measurements: { waist: "32 inches", inseam: "30 inches" },
      gender: "Men",
      color: "Indigo",
      brand: "Helmut Lang",
    },
    // Stussy Variants
    {
      name: "Vintage Stussy Hoodie (Black)",
      slug: "stussy-hoodie-black",
      stock: 5,
      isFinalSale: false,
      measurements: { pit_to_pit: "23 inches", length: "27 inches" },
      gender: "Unisex",
      color: "Black",
      brand: "Stussy",
    },
    {
      name: "Vintage Stussy Hoodie (Grey)",
      slug: "stussy-hoodie-grey",
      stock: 2,
      isFinalSale: false,
      measurements: { pit_to_pit: "21 inches", length: "25 inches" },
      gender: "Women",
      color: "Grey",
      brand: "Stussy",
    },
    // Adidas Samba Variants
    {
      name: "Adidas Samba OG (White)",
      slug: "adidas-samba-white",
      stock: 0, // SOLD OUT
      isFinalSale: true,
      measurements: { size: "US 7" },
      gender: "Women",
      color: "White",
      brand: "Adidas",
    },
    {
      name: "Adidas Samba OG (Black)",
      slug: "adidas-samba-black",
      stock: 3,
      isFinalSale: true,
      measurements: { size: "US 10" },
      gender: "Men",
      color: "Black",
      brand: "Adidas",
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
