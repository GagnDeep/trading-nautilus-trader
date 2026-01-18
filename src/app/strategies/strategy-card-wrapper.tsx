"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StrategyConfigForm } from "@/components/StrategyConfigForm";
import { useRouter } from "next/navigation";

export function StrategyCardWrapper({ strategy }: { strategy: any }) {
    const utils = api.useUtils();
    const router = useRouter();

    const startBacktestMutation = api.trading.startBacktest.useMutation();
    const startLiveMutation = api.trading.startLive.useMutation();

    const handleStart = async (id: string, params: any, mode: "BACKTEST" | "LIVE") => {
        if (mode === "BACKTEST") {
            const result = await startBacktestMutation.mutateAsync({ strategyId: id, params });
            router.push(`/monitor/${result.id}`);
        } else {
            const result = await startLiveMutation.mutateAsync({ strategyId: id, params });
            router.push(`/monitor/${result.id}`);
        }
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{strategy.name}</CardTitle>
                    <Badge variant="secondary">Algo</Badge>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                    {strategy.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                    {strategy.file_path}
                </div>
            </CardContent>
            <CardFooter>
                <StrategyConfigForm strategy={strategy} onStart={handleStart} />
            </CardFooter>
        </Card>
    );
}
