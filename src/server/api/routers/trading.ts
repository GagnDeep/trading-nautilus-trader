import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { PrismaClient } from "@prisma/client";

// We'll rely on the global prisma instance usually but for now let's import it or use ctx.prisma
// Standard t3 stack passes prisma in ctx.

export const tradingRouter = createTRPCRouter({
  // 1. Get all available strategies
  getStrategies: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.strategy.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // 2. Start a Backtest
  startBacktest: publicProcedure
    .input(
      z.object({
        strategyId: z.string(),
        params: z.record(z.any()), // JSON config for the strategy
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create a new Session record
      const session = await ctx.db.session.create({
        data: {
          strategyId: input.strategyId,
          type: "BACKTEST",
          status: "RUNNING",
          configUsed: JSON.stringify(input.params),
        },
      });

      // Call Python API to start the runner
      // We will implement the actual fetch call later or mock it for now.
      // Ideally, we'd use fetch(`http://localhost:8000/backtest`, { ... })

      const pythonUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${pythonUrl}/backtest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: session.id,
            strategy_id: input.strategyId, // We might need the filepath, but ID is safer
            config: input.params,
          }),
        });

        if (!res.ok) {
           await ctx.db.session.update({
             where: { id: session.id },
             data: { status: "FAILED" }
           });
           throw new Error("Failed to start python runner");
        }
      } catch (e) {
         console.error(e);
         // If we can't reach python, fail the session
         await ctx.db.session.update({
             where: { id: session.id },
             data: { status: "FAILED" }
           });
           throw new Error("Could not connect to Trading Engine");
      }

      return session;
    }),

  // 3. Start Live Trading
  startLive: publicProcedure
    .input(
      z.object({
        strategyId: z.string(),
        params: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.session.create({
        data: {
          strategyId: input.strategyId,
          type: "LIVE",
          status: "RUNNING",
          configUsed: JSON.stringify(input.params),
        },
      });

      const pythonUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${pythonUrl}/live`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: session.id,
            strategy_id: input.strategyId,
            config: input.params,
          }),
        });

         if (!res.ok) {
           await ctx.db.session.update({
             where: { id: session.id },
             data: { status: "FAILED" }
           });
           throw new Error("Failed to start python runner");
        }
      } catch (e) {
        console.error(e);
        await ctx.db.session.update({
             where: { id: session.id },
             data: { status: "FAILED" }
           });
        throw new Error("Could not connect to Trading Engine");
      }

      return session;
    }),

  // 4. Get Session Details (Polling fallback or initial load)
  getSession: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.session.findUnique({
        where: { id: input.id },
        include: { strategy: true },
      });
    }),

  // 5. Get Metrics History (Equity Curve)
  getSessionMetrics: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.metric.findMany({
        where: { sessionId: input.sessionId },
        orderBy: { timestamp: "asc" },
      });
    }),

  // 6. Get Trade Blotter
  getSessionTrades: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.trade.findMany({
        where: { sessionId: input.sessionId },
        orderBy: { timestamp: "desc" },
      });
    }),

  // 7. Get Recent Sessions (for Dashboard)
  getRecentSessions: publicProcedure
    .query(async ({ ctx }) => {
        return ctx.db.session.findMany({
            take: 5,
            orderBy: { startTime: 'desc' },
            include: { strategy: true }
        })
    })
});
