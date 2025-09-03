"use client";

import type { PanelData } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

interface MinimizedPanelProps {
  panelData: PanelData;
  onRestore: (id: string) => void;
}

export function MinimizedPanel({ panelData, onRestore }: MinimizedPanelProps) {
  return (
    <div
      className="flex-shrink-0 flex items-center h-10 px-3 rounded-md bg-neutral-800/80 border border-neutral-700 text-sm text-white cursor-pointer hover:bg-neutral-700/80 transition-colors"
      onClick={() => onRestore(panelData.id)}
    >
      <span className="font-code text-xs truncate max-w-xs">{panelData.query}</span>
      <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 hover:bg-neutral-600">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
