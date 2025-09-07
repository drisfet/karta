"use client";

import React, { useEffect,useRef, useState } from 'react';

import { generateId } from 'ai';
import { Message } from 'ai';
import { Minus,X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";

import { PanelChat } from '@/components/panel-chat';

import { BasePanelConfig,PanelComponentProps } from '../panel-registry';

interface PrimePanelConfig extends BasePanelConfig {
  type: 'PRIME';
  props: {
    query: string;
    models?: any[];
  };
}

interface PrimePanelProps extends PanelComponentProps<PrimePanelConfig> {}

export function PrimePanel({
  id,
  config,
  onUpdate,
  onClose,
  onFocus,
  onMinimize,
  onPositionChange,
  onSizeChange
}: PrimePanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [chatId] = useState(() => `panel-chat-${id}`); // Generate once and persist

  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  // Create initial message from the query prop
  const initialMessages: Message[] = React.useMemo(() => {
    if (config.props.query && config.props.query.trim()) {
      return [{
        id: `initial-${id}`,
        role: 'user' as const,
        content: config.props.query.trim()
      }];
    }
    return [];
  }, [config.props.query, id]);

  // Use models from props or load them if not provided
  const models = config.props.models || [];

  useEffect(() => {
    // If models are provided via props, mark as loaded
    if (models.length > 0) {
      setModelsLoaded(true);
    } else {
      // Fallback: load models if not provided
      const loadModels = async () => {
        try {
          const response = await fetch('/config/models.json');
          if (response.ok) {
            const config = await response.json();
            if (config.models && Array.isArray(config.models)) {
              // Note: models state is not used here since we're using props
              setModelsLoaded(true);
            }
          }
        } catch (error) {
          console.error('Failed to load models:', error);
          setModelsLoaded(true); // Show component even on error
        }
      };
      loadModels();
    }
  }, [models.length]);

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;
    onFocus();
    setIsDragging(true);
    const panelRect = panelRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - panelRect.left, y: e.clientY - panelRect.top };
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onPositionChange({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={panelRef}
      className="absolute flex flex-col rounded-xl shadow-2xl shadow-black/50 transition-shadow duration-300"
      style={{
        left: `${config.position?.x || 100}px`,
        top: `${config.position?.y || 100}px`,
        width: `${config.size?.width || 600}px`,
        height: `${config.size?.height || 700}px`,
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
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <p className="font-code text-xs font-medium truncate select-none">{config.title}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMinimize}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-col flex-grow min-h-0">
          {modelsLoaded ? (
            <PanelChat
              chatId={chatId}
              models={models}
              initialMessages={initialMessages}
              placeholder={`Ask about ${config.props.query || 'anything'}...`}
              compactMode={false}
              onMessageSent={(message) => {
                console.log('Panel message sent:', message)
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading models...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}