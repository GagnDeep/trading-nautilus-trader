"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
}

interface LogTerminalProps {
  logs: LogMessage[];
  className?: string;
}

export function LogTerminal({ logs, className }: LogTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        // Find the scroll viewport inside ScrollArea
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [logs]);

  const getColor = (level: string) => {
    switch (level) {
      case "INFO": return "text-green-400";
      case "WARNING": return "text-yellow-400";
      case "ERROR": return "text-red-500";
      default: return "text-gray-300";
    }
  };

  return (
    <div className={cn("rounded-md border bg-slate-950 font-mono text-xs", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <span className="text-slate-400">Terminal Output</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
      </div>
      <ScrollArea className="h-[300px] w-full p-4" ref={scrollRef}>
        <div className="flex flex-col gap-1">
          {logs.length === 0 && <span className="text-slate-600 italic">No logs...</span>}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-500 shrink-0">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className={cn("font-bold shrink-0", getColor(log.level))}>
                {log.level}
              </span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
