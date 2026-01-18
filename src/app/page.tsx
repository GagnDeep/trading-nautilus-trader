import { HydrateClient } from "@/trpc/server";
import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const recentSessions = await api.trading.getRecentSessions();
  const activeStrategies = await api.trading.getStrategies();

  return (
    <HydrateClient>
      <main className="container mx-auto p-8 space-y-8">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
                Mission Control
                </h1>
                <p className="text-muted-foreground">
                NautilusTrader Orchestration System
                </p>
            </div>
            <Link href="/strategies">
                <Button size="lg" className="font-semibold">
                    Deploy Strategy <Zap className="ml-2 w-4 h-4"/>
                </Button>
            </Link>
        </header>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStrategies.length}</div>
              <p className="text-xs text-muted-foreground">Available in library</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentSessions.length}</div>
              <p className="text-xs text-muted-foreground">Total sessions executed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentSessions.length === 0 && <p className="text-muted-foreground">No recent activity.</p>}
                    {recentSessions.map(session => (
                        <div key={session.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${session.status === 'COMPLETED' ? 'bg-green-500' : session.status === 'RUNNING' ? 'bg-blue-500' : 'bg-red-500'}`} />
                                <div>
                                    <p className="text-sm font-medium leading-none">{session.strategy.name}</p>
                                    <p className="text-xs text-muted-foreground">{session.type} • {new Date(session.startTime).toLocaleString()}</p>
                                </div>
                            </div>
                            <Link href={`/monitor/${session.id}`}>
                                <Button variant="outline" size="sm">Monitor</Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
             <CardHeader>
                <CardTitle>System Status</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">Nautilus Engine: Online</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">Redis Bridge: Connected</span>
                </div>
             </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
