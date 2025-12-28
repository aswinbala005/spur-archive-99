import { Type } from "@sinclair/typebox";
import { desc } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "../db";
import { products } from "../db/schema";

// Schema for a single product in the response
const ProductSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  slug: Type.String(),
  stock: Type.Number(),
  isFinalSale: Type.Union([Type.Boolean(), Type.Null()]),
  measurements: Type.Any(), // JSONB type
  gender: Type.String(),
  color: Type.String(),
  brand: Type.String(),
  // TypeBox handles Date objects as strings in JSON responses usually, but let's be safe
  createdAt: Type.Any(),
});

const ProductsResponseSchema = Type.Array(ProductSchema);

const productRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/products",
    {
      schema: {
        response: {
          200: ProductsResponseSchema,
          "5xx": Type.Object({ error: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      try {
        const allProducts = await db
          .select()
          .from(products)
          .orderBy(desc(products.createdAt));
        return reply.send(allProducts);
      } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: "Failed to fetch products" });
      }
    },
  );
};

export default productRoutes;
