import { and, ilike } from "drizzle-orm";
import { db } from "../db";
import { products } from "../db/schema";

export const InventoryService = {
  // TOOL 1: Check Stock & Details
  // Uses fuzzy search (ilike) to find products even if the user makes a typo
  async checkStock(productName: string) {
    console.log(`🔎 Searching DB for: ${productName}`);

    // Split query into words to allow non-contiguous matching
    // e.g. "Helmut Jeans" matches "Helmut Lang Painter Jeans"
    const searchTerms = productName.trim().split(/\s+/);
    const conditions = searchTerms.map((term) =>
      ilike(products.name, `%${term}%`),
    );

    const results = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    // Return specific fields needed for sizing/availability questions
    const item = results[0];
    return {
      name: item.name,
      stock: item.stock,
      isFinalSale: item.isFinalSale,
      measurements: item.measurements,
    };
  },

  // TOOL 2: List All Products (Broader Search)
  async listProducts() {
    console.log("SEARCH: Listing all available products...");
    const results = await db
      .select({
        name: products.name,
        stock: products.stock,
        color: products.color,
        brand: products.brand,
      })
      .from(products)
      .limit(10); // Safe limit for context window

    return results;
  },

  // TOOL 2: Order Tracking (Mocked for Demo)
  // In a real app, this would query an 'orders' table.
  async getOrderStatus(orderId: string) {
    // Scenario 1: Shipped Item
    if (orderId === "MK-9090") {
      return {
        id: "MK-9090",
        status: "In Transit",
        carrier: "DHL Express",
        eta: "Tuesday, Dec 31st",
        items: ["Akira Tee 1998"],
      };
    }

    // Scenario 2: Processing Item
    if (orderId === "MK-1234") {
      return {
        id: "MK-1234",
        status: "Processing",
        carrier: "Pending",
        eta: "Unknown",
        items: ["Carhartt Jacket"],
      };
    }

    // Scenario 3: Not Found
    return null;
  },
};
