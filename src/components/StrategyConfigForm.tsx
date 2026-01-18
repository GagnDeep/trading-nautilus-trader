"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Play, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StrategyConfigFormProps {
  strategy: {
    id: string;
    name: string;
    description: string;
    default_params: string;
    file_path: string;
  };
  onStart: (id: string, params: any, mode: "BACKTEST" | "LIVE") => Promise<void>;
}

export function StrategyConfigForm({ strategy, onStart }: StrategyConfigFormProps) {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState(JSON.parse(strategy.default_params));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleParamChange = (key: string, value: string) => {
    // Try to parse number if possible
    const num = parseFloat(value);
    setParams((prev: any) => ({
      ...prev,
      [key]: isNaN(num) ? value : num,
    }));
  };

  const handleRun = async (mode: "BACKTEST" | "LIVE") => {
    setLoading(true);
    try {
      // Inject strategy name into params so Python knows what to load
      // The file_path usually has the filename, e.g. "Momentum.py"
      const config = {
        ...params,
        strategy_name: strategy.file_path,
      };

      await onStart(strategy.id, config, mode);
      setOpen(false);
      toast.success(`${mode} started successfully`);
    } catch (error) {
      toast.error(`Failed to start ${mode}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Configure & Run <Play className="w-4 h-4 ml-2" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{strategy.name}</SheetTitle>
          <SheetDescription>{strategy.description}</SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <div className="text-sm font-medium text-muted-foreground">Parameters</div>
          {Object.keys(params).map((key) => (
            <div key={key} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={key} className="text-right">
                {key}
              </Label>
              <Input
                id={key}
                value={params[key]}
                onChange={(e) => handleParamChange(key, e.target.value)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => handleRun("BACKTEST")}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Starting..." : "Run Backtest"}
          </Button>
          <Button
            onClick={() => handleRun("LIVE")}
            variant="destructive"
            disabled={loading}
            className="w-full"
          >
             {loading ? "Starting..." : <>Run Live <Rocket className="w-4 h-4 ml-2" /></>}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
