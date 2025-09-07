import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, Expand, X, Minus } from "lucide-react";
import { PanelComponentProps, BasePanelConfig } from '../panel-registry';
import Image from 'next/image';

interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

interface SourcesPanelProps extends PanelComponentProps {
  config: BasePanelConfig & {
    type: 'SOURCES';
    props: {
      sources: Source[];
    };
  };
}

export function SourcesPanel({
  id,
  config,
  onUpdate,
  onClose,
  onFocus,
  onMinimize,
  onPositionChange,
  onSizeChange
}: SourcesPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    onFocus();
    setIsDragging(true);
    const panelRect = panelRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - panelRect.left, y: e.clientY - panelRect.top };
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseDownResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFocus();
    setIsResizing(true);
    document.body.style.cursor = 'se-resize';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && onPositionChange) {
      onPositionChange({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    }
    if (isResizing && onSizeChange) {
      const panelRect = panelRef.current!.getBoundingClientRect();
      const newWidth = Math.max(400, e.clientX - panelRect.left + 8);
      const newHeight = Math.max(300, e.clientY - panelRect.top + 8);
      onSizeChange({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, onPositionChange, onSizeChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      className="absolute flex flex-col rounded-xl shadow-2xl shadow-black/50 transition-shadow duration-300"
      style={{
        left: `${config.position?.x || 0}px`,
        top: `${config.position?.y || 0}px`,
        width: `${config.size?.width || 550}px`,
        height: `${config.size?.height || 600}px`,
        zIndex: config.zIndex || 1,
        boxShadow: `0 0 20px 0 hsl(var(--primary) / 0.3), 0 25px 50px -12px rgb(0 0 0 / 0.5)`
      }}
      onMouseDown={() => onFocus()}
    >
      <div className="flex-grow rounded-xl border border-primary/30 bg-neutral-900/60 backdrop-blur-xl flex flex-col overflow-hidden">
        <CardHeader
          className="flex-row items-center justify-between p-3 border-b cursor-grab flex-shrink-0"
          onMouseDown={handleMouseDownDrag}
        >
          <p className="font-code text-xs font-medium truncate select-none">{config.title}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Expand className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMinimize}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex-grow overflow-y-auto p-4">
          <div className="space-y-3">
            {config.props.sources?.map((source, index) => (
              <a
                key={source.id || index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-md hover:bg-white/5 transition-colors border border-white/10"
              >
                {source.favicon && (
                  <Image
                    src={source.favicon}
                    alt=""
                    width={16}
                    height={16}
                    className="flex-shrink-0 mt-0.5"
                  />
                )}
                <div className="flex-grow min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{source.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{source.snippet}</p>
                  <p className="text-xs text-primary mt-1 truncate">{source.url}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize z-10"
        onMouseDown={handleMouseDownResize}
      />
    </div>
  );
}