"use client";

import { api } from "@/trpc/react";
import { LogTerminal } from "@/components/LogTerminal";
import { TradeBlotter } from "@/components/TradeBlotter";
import { EquityChart } from "@/components/EquityChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { toast } from "sonner";

export default function MonitorPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use() to unwrap the params promise
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [logs, setLogs] = useState<any[]>([]);
  const [liveMetric, setLiveMetric] = useState<any[]>([]);
  const [liveTrades, setLiveTrades] = useState<any[]>([]);

  // Fetch initial data
  const { data: session, isLoading } = api.trading.getSession.useQuery({ id });
  const { data: initialMetrics } = api.trading.getSessionMetrics.useQuery({ sessionId: id });
  const { data: initialTrades } = api.trading.getSessionTrades.useQuery({ sessionId: id });

  // Update state when initial data loads
  useEffect(() => {
    if (initialMetrics) setLiveMetric(initialMetrics);
  }, [initialMetrics]);

  useEffect(() => {
    if (initialTrades) setLiveTrades(initialTrades);
  }, [initialTrades]);

  // WebSocket Connection
  useEffect(() => {
    if (!id) return;

    // In a real env, use env var. For now assume localhost:8000
    const wsUrl = `ws://localhost:8000/ws/${id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        // toast.info("Connected to Live Feed");
        setLogs(prev => [...prev, { level: "INFO", message: "Connected to Live Feed", timestamp: new Date().toISOString() }]);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'log') {
                setLogs(prev => [...prev, data]);
            } else if (data.type === 'metric') {
                setLiveMetric(prev => [...prev, data]);
            } else if (data.type === 'trade') {
                setLiveTrades(prev => [data, ...prev]);
            }
        } catch (e) {
            console.error("WS Parse Error", e);
        }
    };

    ws.onerror = (e) => {
        console.error("WS Error", e);
        setLogs(prev => [...prev, { level: "ERROR", message: "WebSocket Connection Error", timestamp: new Date().toISOString() }]);
    };

    return () => {
        ws.close();
    };
  }, [id]);

  if (isLoading || !session) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="animate-spin w-8 h-8" />
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
            <Link href="/strategies">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    {session.strategy.name}
                    <Badge variant={session.status === "RUNNING" ? "default" : "secondary"}>
                        {session.status}
                    </Badge>
                </h1>
                <p className="text-xs text-muted-foreground font-mono">ID: {session.id}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="text-right">
                <div className="text-sm font-medium">PnL</div>
                <div className="text-xl font-bold text-green-500">
                    {/* Calculate roughly from last metric */}
                    {liveMetric.length > 0
                        ? (liveMetric[liveMetric.length-1].equity - liveMetric[0].equity).toFixed(2)
                        : "0.00"}
                </div>
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Left Column: Chart & Blotter */}
        <div className="md:col-span-2 flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-[300px]">
                <EquityChart data={liveMetric} />
            </div>
            <div className="h-[300px]">
                <TradeBlotter trades={liveTrades} />
            </div>
        </div>

        {/* Right Column: Logs */}
        <div className="md:col-span-1 h-full min-h-0 flex flex-col">
             <div className="font-semibold mb-2">Live Logs</div>
             <LogTerminal logs={logs} className="flex-1" />
        </div>
      </div>
    </div>
  );
}
