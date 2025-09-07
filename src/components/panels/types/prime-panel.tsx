"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, Expand, X, Minus, FileText, Image as ImageIcon, Link as LinkIcon, ListChecks, MessageSquare, Loader2, ChevronDown } from "lucide-react";
import { PanelComponentProps, BasePanelConfig } from '../panel-registry';
import { StreamingChat } from './streaming-chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { UIMessage } from 'ai';
import { useChatModel } from '@/hooks/use-chat-model';
import { useDynamicChat } from '@/hooks/use-dynamic-chat';
import { getModelDisplayName, getProviderColor } from '@/lib/models';

// ChatComponent to handle dynamic chat with model switching
const ChatComponent = ({
  searchContext,
  initialMessages,
  onChat
}: {
  searchContext: string;
  initialMessages: UIMessage[];
  onChat: (chat: any) => void;
}) => {
  const chat = useDynamicChat({
    api: '/api/chat',
    initialMessages,
    searchContext
  });

  // Memoize chat properties to avoid infinite re-renders
  const chatData = useMemo(() => ({
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    isLoading: chat.isLoading,
    error: chat.error
  }), [chat.messages, chat.sendMessage, chat.isLoading, chat.error]);

  useEffect(() => {
    console.log('ChatComponent - Sending chatData to parent');
    console.log('ChatComponent - Messages count:', chatData.messages.length);
    console.log('ChatComponent - Is loading:', chatData.isLoading);
    onChat(chatData);
  }, [chatData, onChat]);

  return null;
};

interface Citation {
  id: string;
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

interface PrimePanelConfig extends BasePanelConfig {
  type: 'PRIME';
  props: {
    summary: string;
    images?: Array<{ url: string; alt: string; aiHint?: string }>;
    sources?: Array<{ url: string; title: string; favicon: string }>;
    steps?: string[];
    citations?: Citation[];
    followUpHistory?: Array<{ query: string; answer: string }>;
    isLoading?: boolean;
    error?: string | null;
    retryCount?: number;
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
  // Removed debug logs - functionality is working

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [useStreamingChat, setUseStreamingChat] = useState(true);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [isSearchResultsExpanded, setIsSearchResultsExpanded] = useState(false);
  const [previousModel, setPreviousModel] = useState<string | null>(null);
  const [modelChanged, setModelChanged] = useState(false);
  const [chatState, setChatState] = useState<{
    messages: UIMessage[];
    sendMessage: (message: { text: string }) => void;
    isLoading: boolean;
    error: Error | null;
  } | null>(null);

  // Memoize the callback to prevent infinite re-renders
  const handleChatUpdate = useCallback((chat: any) => {
    console.log('PrimePanel - Received chat update');
    console.log('PrimePanel - Chat messages count:', chat.messages?.length || 0);
    console.log('PrimePanel - Chat isLoading:', chat.isLoading);
    setChatState(chat);
  }, []);

  // Use global chat model state
  const { selectedModel } = useChatModel();
  // console.log('PrimePanel - Selected chat model:', selectedModel);

  // Track model changes
  useEffect(() => {
    if (previousModel && previousModel !== selectedModel) {
      setModelChanged(true);
      // Reset the highlight after 3 seconds
      const timer = setTimeout(() => setModelChanged(false), 3000);
      return () => clearTimeout(timer);
    }
    setPreviousModel(selectedModel);
  }, [selectedModel, previousModel]);


  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  // Prepare search context for API
  const searchContext = useMemo(() => {
    if (!config.props.summary) return '';
    return config.props.summary.replace(/<[^>]*>/g, '').trim();
  }, [config.props.summary]);

  // Prepare initial messages including search results
  const initialMessages = useMemo(() => {
    if (!config.props.summary) return [];

    const strippedHtml = config.props.summary.replace(/<[^>]*>/g, '').trim();
    if (!strippedHtml) return [];

    return [{
      id: 'search-results',
      role: 'assistant' as const,
      parts: [{ type: 'text' as const, text: `Based on the search results:\n\n${strippedHtml}` }]
    }];
  }, [config.props.summary]);

  // Initialize chat with search results as initial messages
  // Chat is handled by ChatComponent below

  // Custom sendMessage that tracks first message and injects search context
  const sendMessage = useCallback((message: { text: string }) => {
    console.log('PrimePanel - sendMessage called with:', message);
    if (!chatState) {
      console.log('PrimePanel - No chatState available');
      return; // Guard clause
    }

    const { sendMessage: originalSendMessage } = chatState;
    if (!hasSentFirstMessage && searchContext) {
      setHasSentFirstMessage(true);
      console.log('PrimePanel - Sending first message with search context');
      // Send system message with search context
      originalSendMessage({
        text: `[SYSTEM CONTEXT]\n${searchContext}\n\n[USER MESSAGE]\n${message.text}`
      });
    } else {
      if (!hasSentFirstMessage) {
        setHasSentFirstMessage(true);
      }
      console.log('PrimePanel - Sending regular message');
      originalSendMessage(message);
    }
  }, [chatState, hasSentFirstMessage, searchContext]);

  // Combine search results with chat messages for display
  const displayMessages = useMemo(() => {
    console.log('PrimePanel - Calculating displayMessages');
    console.log('PrimePanel - chatState:', chatState ? 'available' : 'null');
    console.log('PrimePanel - chatState messages count:', chatState?.messages?.length || 0);

    if (!chatState || !config.props.summary) return chatState?.messages || [];

    const { messages } = chatState;
    const strippedHtml = config.props.summary.replace(/<[^>]*>/g, '').trim();
    if (!strippedHtml) return messages;

    // If we haven't sent the first message yet, show search results as first message
    if (!hasSentFirstMessage) {
      const searchMessage: UIMessage = {
        id: 'search-results-display',
        role: 'assistant',
        parts: [{ type: 'text', text: `Based on the search results:\n\n${strippedHtml}` }]
      };
      const result = [searchMessage, ...messages];
      console.log('PrimePanel - displayMessages with search results:', result.length);
      return result;
    }

    // After first message, don't include search results in chat (they're pinned below)
    console.log('PrimePanel - displayMessages without search results:', messages.length);
    console.log('PrimePanel - Final displayMessages:', messages);
    return messages;
  }, [chatState, config.props.summary, hasSentFirstMessage]);

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, [role="tab"]')) return;
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
    if (isDragging) {
      onPositionChange({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    }
    if (isResizing) {
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

  const renderCitations = (text: string) => {
    if (!config.props.citations) return text;

    return text.replace(/<sup[^>]*data-cite=['"]([^'"]+)['"][^>]*>(.*?)<\/sup>/g, (match: any, citeId: string, content: string) => {
      const citation = config.props.citations?.find((c: Citation) => c.id === citeId);
      if (!citation) return match;

      return `<sup class="cursor-pointer text-primary hover:text-primary/80" title="${citation.title}: ${citation.snippet}">[${content}]</sup>`;
    });
  };


  // If no model is selected, show a message to select one
  if (!selectedModel) {
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
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <p className="font-code text-xs font-medium truncate select-none">{config.title}</p>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-neutral-700/50 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full text-gray-400" />
                <span className="truncate max-w-24">Select Model</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <div className="flex flex-col flex-grow min-h-0">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">Select a chat model to start chatting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <p className="font-code text-xs font-medium truncate select-none">{config.title}</p>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all duration-300 ${
              modelChanged
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse'
                : 'bg-neutral-700/50 text-muted-foreground'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${selectedModel ? getProviderColor(selectedModel) : 'text-gray-400'}`} />
              <span className="truncate max-w-24">
                {selectedModel ? getModelDisplayName(selectedModel) : 'Select Model'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Expand className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setUseStreamingChat(!useStreamingChat)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMinimize}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-col flex-grow min-h-0">
          {/* ChatComponent to handle chat state */}
          <ChatComponent
            searchContext={searchContext}
            initialMessages={initialMessages}
            onChat={handleChatUpdate}
          />
          {chatState ? (() => {
            const { isLoading, error } = chatState;

            // Inline renderContent with local variables
            return (
              <Tabs defaultValue="answer" className="flex flex-col flex-grow h-full">
                <TabsList className="mx-4 mt-2 bg-transparent p-0 border-b border-white/10 rounded-none justify-start gap-4 flex-shrink-0">
                  <TabsTrigger value="answer" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-2 text-muted-foreground">
                    <FileText className="mr-2" /> Answer
                  </TabsTrigger>
                  <TabsTrigger value="images" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-2 text-muted-foreground">
                    <ImageIcon className="mr-2" /> Images
                  </TabsTrigger>
                  <TabsTrigger value="sources" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-2 text-muted-foreground">
                    <LinkIcon className="mr-2" /> Sources
                  </TabsTrigger>
                  <TabsTrigger value="steps" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-2 text-muted-foreground">
                    <ListChecks className="mr-2" /> Steps
                  </TabsTrigger>
                </TabsList>

                <div className="flex-grow overflow-y-auto">
                  <TabsContent value="answer" className="p-0 mt-0 h-full">
                    {useStreamingChat ? (
                      <StreamingChat
                        messages={displayMessages}
                        sendMessage={sendMessage}
                        status={isLoading ? 'streaming' : 'ready'}
                        error={error || null}
                        isLoading={config.props.isLoading}
                        modelSelected={!!selectedModel}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div
                          className="text-sm leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderCitations(config.props.summary) }}
                        />
                        {config.props.followUpHistory && config.props.followUpHistory.length > 0 && (
                          <div className="border-t border-white/10 pt-4" />
                        )}
                        {config.props.followUpHistory?.map((item: { query: string; answer: string }, index: number) => (
                          <div key={index} className="space-y-2">
                            <p className="font-code text-xs font-semibold text-muted-foreground">{item.query}</p>
                            <p className="text-sm">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="images" className="p-4 mt-0">
                    {config.props.images && config.props.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {config.props.images.map((image: { url: string; alt: string; aiHint?: string }, index: number) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                            <Image
                              src={image.url}
                              alt={image.alt}
                              fill
                              className="object-cover"
                              data-ai-hint={image.aiHint}
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No images available for this query</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sources" className="p-4 mt-0">
                    {config.props.sources && config.props.sources.length > 0 ? (
                      <div className="space-y-3">
                        {config.props.sources.map((source: { url: string; title: string; favicon: string }, index: number) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors"
                          >
                            <Image src={source.favicon} alt="" width={16} height={16} className="flex-shrink-0" />
                            <span className="text-sm truncate text-muted-foreground hover:text-white">{source.title}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No sources available for this query</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="steps" className="p-4 mt-0">
                    {config.props.steps && config.props.steps.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        {config.props.steps.map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No step-by-step breakdown available</p>
                      </div>
                    )}
                  </TabsContent>
                </div>

                {/* Pinned Search Results - appears after first message */}
                {hasSentFirstMessage && searchContext && (
                  <div className="border-t border-white/10 bg-neutral-900/30">
                    <button
                      onClick={() => setIsSearchResultsExpanded(!isSearchResultsExpanded)}
                      className="w-full flex items-center justify-between p-3 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Search Results</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Reference
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isSearchResultsExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isSearchResultsExpanded && (
                      <div className="px-4 pb-4">
                        <div className="bg-neutral-800/50 rounded-lg p-3 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                          <div className="whitespace-pre-wrap">
                            {searchContext}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Tabs>
            );
          })() : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading chat...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 right-0 h-6 w-6 cursor-se-resize z-10 flex items-end justify-end p-1"
        onMouseDown={handleMouseDownResize}
      >
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-neutral-400/50 opacity-60 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}