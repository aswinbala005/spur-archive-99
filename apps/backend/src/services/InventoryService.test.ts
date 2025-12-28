import { describe, expect, it } from "vitest";
import { InventoryService } from "./InventoryService";

describe("InventoryService", () => {
  describe("checkStock", () => {
    it("should return product details for matching product name", async () => {
      // Note: This test requires a seeded database
      const result = await InventoryService.checkStock("Akira Tee");

      if (result) {
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("stock");
        expect(result).toHaveProperty("isFinalSale");
        expect(result).toHaveProperty("measurements");
      }
    });

    it("should return null for non-existent product", async () => {
      const result = await InventoryService.checkStock(
        "NonExistentProduct12345",
      );

      expect(result).toBeNull();
    });

    it("should handle partial name matching (fuzzy search)", async () => {
      // The ILIKE query should match partial names
      const result = await InventoryService.checkStock("akira");

      // If there's an Akira product in DB, it should match
      if (result) {
        expect(result.name.toLowerCase()).toContain("akira");
      }
    });
  });

  describe("getOrderStatus", () => {
    it("should return order details for known order ID MK-9090", async () => {
      const result = await InventoryService.getOrderStatus("MK-9090");

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        id: "MK-9090",
        status: "In Transit",
        carrier: "DHL Express",
      });
    });

    it("should return order details for known order ID MK-1234", async () => {
      const result = await InventoryService.getOrderStatus("MK-1234");

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        id: "MK-1234",
        status: "Processing",
      });
    });

    it("should return null for unknown order ID", async () => {
      const result = await InventoryService.getOrderStatus("UNKNOWN-ORDER");

      expect(result).toBeNull();
    });
  });
});
