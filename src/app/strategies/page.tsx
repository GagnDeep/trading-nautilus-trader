import { api } from "@/trpc/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StrategyConfigForm } from "@/components/StrategyConfigForm";
import { redirect } from "next/navigation";

export default async function StrategiesPage() {
  const strategies = await api.trading.getStrategies();

  async function startStrategy(id: string, params: any, mode: "BACKTEST" | "LIVE") {
    "use server";
    // We need to call the mutation but we are in a server component action context.
    // However, the Form component is Client. The best way is to pass a Server Action or use TRPC client side in the component.
    // But since the Prompt requested "The tRPC router", I will update the Client Component to use TRPC client hook.
    // So the 'onStart' prop in StrategyConfigForm should be handled by the parent if the parent is client,
    // OR we pass a Server Action wrapper here.

    // Actually, StrategyConfigForm is "use client", so it can use TRPC client directly if we wrap the page or pass the function.
    // BUT StrategyConfigForm was defined with `onStart: (id: string, params: any, mode: "BACKTEST" | "LIVE") => Promise<void>;`
    // I will modify this page to be a Server Component that renders the list,
    // but the actual interaction logic is better handled by a Client Wrapper or just let the Client Component handle TRPC.

    // Let's make a Client Wrapper for the list item or change StrategyConfigForm to use TRPC internally.
    // For now, I will create a client component wrapper for the interaction part.
  }

  // Actually, I can't pass a Server Action easily to `onStart` if it's not defined here.
  // I will make a new component `StrategyGrid` which is a Client Component.

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Strategy Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
            <StrategyCardWrapper key={strategy.id} strategy={strategy} />
        ))}
      </div>
    </div>
  );
}

// Client wrapper to handle TRPC mutations
import { StrategyCardWrapper } from "./strategy-card-wrapper";
