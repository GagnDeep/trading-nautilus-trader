"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metric {
  timestamp: string | Date;
  equity: number;
}

interface EquityChartProps {
  data: Metric[];
}

export function EquityChart({ data }: EquityChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString(),
        value: d.equity
    }));
  }, [data]);

  const latestEquity = chartData.length > 0 ? chartData[chartData.length - 1]?.value ?? 0 : 0;
  const startEquity = chartData.length > 0 ? chartData[0]?.value ?? 0 : 0;
  const pnl = latestEquity - startEquity;
  const isPositive = pnl >= 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Equity Curve</CardTitle>
        <div className={isPositive ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
             {isPositive ? "+" : ""}{pnl.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
                dataKey="time"
                tick={{fontSize: 10, fill: "hsl(var(--muted-foreground))"}}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
            />
            <YAxis
                domain={['auto', 'auto']}
                tick={{fontSize: 10, fill: "hsl(var(--muted-foreground))"}}
                tickFormatter={(val) => val.toLocaleString()}
                tickLine={false}
                axisLine={false}
                width={60}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "6px"
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "#22c55e" : "#ef4444"}
              fillOpacity={1}
              fill="url(#colorEquity)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
