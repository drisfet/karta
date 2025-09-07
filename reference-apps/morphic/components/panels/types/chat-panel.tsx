"use client";

import React, { useEffect, useRef, useState } from 'react';

import { generateId } from 'ai';
import { Message } from 'ai';
import { Minus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";

import { PanelChat } from '@/components/panel-chat';

import { BasePanelConfig, PanelComponentProps } from '../panel-registry';

interface ChatPanelConfig extends BasePanelConfig {
  type: 'CHAT_PANEL';
  props: {
    title?: string;
    placeholder?: string;
    compactMode?: boolean;
    showModelSelector?: boolean;
    showSearchToggle?: boolean;
    models?: any[];
  };
}

interface ChatPanelProps extends PanelComponentProps<ChatPanelConfig> {}

export function ChatPanel({
  id,
  config,
  onUpdate,
  onClose,
  onFocus,
  onMinimize,
  onPositionChange,
  onSizeChange
}: ChatPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [chatId] = useState(() => `chat-panel-${id}`); // Generate once and persist

  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  // ChatPanel doesn't use initial messages - it's for manual chat creation
  const initialMessages: Message[] = [];

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
        width: `${config.size?.width || 500}px`,
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
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <p className="font-code text-xs font-medium truncate select-none">
              {config.props.title || config.title || 'Chat Panel'}
            </p>
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
              placeholder={config.props.placeholder || "Ask me anything..."}
              compactMode={config.props.compactMode || false}
              className="h-full"
              onMessageSent={(message) => {
                console.log('Chat panel message sent:', message)
                // You can add custom logic here for when messages are sent
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading chat...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}