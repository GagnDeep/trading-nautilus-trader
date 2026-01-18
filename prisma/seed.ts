import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const strategies = [
    {
      name: "Momentum EMA Cross",
      description: "Classic trend-following strategy using two EMAs.",
      file_path: "Momentum_EMACross.py",
      default_params: JSON.stringify({
        symbol: "EUR/USD",
        fast_period: 10,
        slow_period: 20,
        trade_size: 10000,
      }),
    },
    {
      name: "Mean Reversion Bollinger",
      description: "Counter-trend strategy fading price extremes.",
      file_path: "MeanReversion_Bollinger.py",
      default_params: JSON.stringify({
        symbol: "GBP/USD",
        period: 20,
        std_dev: 2.0,
        trade_size: 10000,
      }),
    },
    {
      name: "VWAP Intraday",
      description: "Institutional execution algorithm relative to VWAP.",
      file_path: "VWAP_Intraday.py",
      default_params: JSON.stringify({
        symbol: "BTC/USD",
        reset_period: "1D",
        threshold: 0.005,
        trade_size: 0.1,
      }),
    },
  ];

  for (const strategy of strategies) {
    const exists = await prisma.strategy.findFirst({
      where: { name: strategy.name },
    });

    if (!exists) {
      await prisma.strategy.create({
        data: strategy,
      });
      console.log(`Created strategy: ${strategy.name}`);
    } else {
      console.log(`Strategy already exists: ${strategy.name}`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
