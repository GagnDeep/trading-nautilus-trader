"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface Trade {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  price: number;
  timestamp: string | Date;
}

interface TradeBlotterProps {
  trades: Trade[];
}

export function TradeBlotter({ trades }: TradeBlotterProps) {
  return (
    <div className="rounded-md border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold leading-none tracking-tight">Trade Blotter</h3>
      </div>
      <div className="relative w-full overflow-auto max-h-[300px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No trades executed yet.
                    </TableCell>
                </TableRow>
            )}
            {trades.map((trade, i) => (
              <TableRow key={trade.id || i}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </TableCell>
                <TableCell>{trade.symbol}</TableCell>
                <TableCell>
                  <Badge
                    variant={trade.side === "BUY" ? "default" : "destructive"}
                    className={trade.side === "BUY" ? "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-200" : "bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-200"}
                  >
                    {trade.side}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{trade.qty}</TableCell>
                <TableCell className="text-right font-mono">{trade.price.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">
                  {(trade.qty * trade.price).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
