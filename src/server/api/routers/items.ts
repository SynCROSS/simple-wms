import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  findAll: protectedProcedure
    .input(
      z.object({
        itemName: z.string().optional(),
        maxPrice: z.number().positive().optional(),
        maxQuantity: z.number().positive().int().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.table(input);
      return await ctx.prisma.item.findMany({
        where: {
          ownerId: ctx.session.user.id,
          ...((input.itemName || input.maxQuantity || input.maxPrice) && {
            OR: [
              {
                name: {
                  contains: input.itemName,
                },
              },
              {
                quantity: {
                  lte: input.maxQuantity,
                },
              },
              {
                price: {
                  lte: input.maxPrice,
                },
              },
            ],
          }),
        },
        orderBy: {
          created_at: "desc",
        },
      });
    }),
  findById: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.item.findUnique({
        where: {
          id: input.itemId,
        },
      });
    }),
  save: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        quantity: z.number().positive().int(),
        remark: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.item.create({
        data: {
          ...input,
          owner: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
  ship: protectedProcedure
    .input(
      z.object({
        itemIds: z.string().array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const items = await ctx.prisma.item.findMany({
        where: {
          id: { in: input.itemIds },
        },
      });

      const updateTargetIds = new Set<string>();
      const deleteTargetIds = new Set<string>();

      for (const item of items) {
        if (item.quantity > 1) {
          updateTargetIds.add(item.id);
        } else {
          deleteTargetIds.add(item.id);
        }
      }

      if (updateTargetIds.size > 0) {
        await ctx.prisma.item.updateMany({
          where: {
            id: { in: [...updateTargetIds] },
          },
          data: {
            quantity: {
              decrement: 1,
            },
          },
        });
      }

      if (deleteTargetIds.size > 0) {
        await ctx.prisma.item.deleteMany({
          where: {
            id: { in: [...deleteTargetIds] },
          },
        });
      }

      return {
        updateTargetIds: [...updateTargetIds],
        deleteTargetIds: [...deleteTargetIds],
      };
    }),
});
