/**
 * Pricing Router — Product cost/price management with formula: (cost × 2) + 10%
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

const costUnitEnum = z.enum(["lb", "oz", "g", "kg", "unit"]);

const GRAMS_PER_UNIT: Record<string, number> = {
  lb: 453.592,
  oz: 28,
  g: 1,
  kg: 1000,
  unit: 1,
};

function calculateSellPrice(costPrice: number, costUnit: string): number {
  if (costUnit === "unit") {
    return Math.ceil(costPrice * 2.2 * 100) / 100;
  }
  const costPerGram = costPrice / GRAMS_PER_UNIT[costUnit];
  return Math.ceil(costPerGram * 2.2 * 100) / 100;
}

export const pricingRouter = router({
  /** List all products with pricing data */
  list: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input?.search) {
        where.name = { contains: input.search, mode: "insensitive" };
      }
      if (input?.category) {
        where.category = { equals: input.category, mode: "insensitive" };
      }
      const products = await ctx.prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
          salePrice: true,
          costPrice: true,
          costUnit: true,
          status: true,
          image: true,
        },
      });
      return products;
    }),

  /** Get distinct categories */
  categories: adminProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    return products.map((p) => p.category);
  }),

  /** Update single product cost and auto-calculate sell price */
  updatePricing: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        costPrice: z.number().positive(),
        costUnit: costUnitEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sellPrice = calculateSellPrice(input.costPrice, input.costUnit);

      return ctx.prisma.product.update({
        where: { id: input.productId },
        data: {
          costPrice: input.costPrice,
          costUnit: input.costUnit,
          price: sellPrice,
        },
      });
    }),

  /** Bulk update pricing for multiple products */
  bulkUpdatePricing: adminProcedure
    .input(
      z.object({
        productIds: z.array(z.number()),
        costPrice: z.number().positive(),
        costUnit: costUnitEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sellPrice = calculateSellPrice(input.costPrice, input.costUnit);

      await ctx.prisma.product.updateMany({
        where: { id: { in: input.productIds } },
        data: {
          costPrice: input.costPrice,
          costUnit: input.costUnit,
          price: sellPrice,
        },
      });

      return { updated: input.productIds.length, newPrice: sellPrice };
    }),
});
