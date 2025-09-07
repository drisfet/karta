import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader } from "@/components/ui/card";
import { Pin, Expand, X, ArrowUp, Loader2, Minus, FileText, MessageSquare } from "lucide-react";
import { PanelComponentProps, BasePanelConfig } from '../panel-registry';
import { StreamingChat } from './streaming-chat';

interface Citation {
  id: string;
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

interface AnswerPanelProps extends PanelComponentProps {
  config: BasePanelConfig & {
    type: 'ANSWER';
    props: {
      html: string;
      citations?: Citation[];
      followUpHistory?: Array<{ query: string; answer: string }>;
    };
  };
}

export function AnswerPanel({
  id,
  config,
  onUpdate,
  onClose,
  onFocus,
  onMinimize,
  onPositionChange,
  onSizeChange
}: AnswerPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [followUpHistory, setFollowUpHistory] = useState(config.props.followUpHistory || []);
  const [isThinkingFollowUp, setIsThinkingFollowUp] = useState(false);
  const [useStreamingChat, setUseStreamingChat] = useState(true); // Default to streaming
  const [isStreamingInitial, setIsStreamingInitial] = useState(false);
  const [chatMessages, setChatMessages] = useState<UIMessage[]>([]);

  const { messages, sendMessage, status, error } = useChat();

  // Sync chatMessages with initial + useChat messages
  useEffect(() => {
     if (config.props.html) {
        // Strip HTML tags from initial message
        const strippedHtml = config.props.html.replace(/<[^>]*>/g, '');
        const initial: UIMessage = {
           id: 'initial',
           role: 'assistant',
           parts: [{ type: 'text', text: strippedHtml }]
        };
        setChatMessages([initial, ...messages]);
     } else {
        setChatMessages(messages);
     }
  }, [config.props.html, messages]);

  console.log('AnswerPanel useChat - messages:', messages);
  console.log('AnswerPanel chatMessages:', chatMessages);
  console.log('AnswerPanel useChat - status:', status);
  console.log('AnswerPanel useChat - error:', error);

  // Memoize the onMessageUpdate function to prevent infinite re-renders
  const handleMessageUpdate = useCallback((content: string) => {
    onUpdate({
      ...config,
      props: {
        ...config.props,
        html: content
      }
    });
  }, [onUpdate, config]);

  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const answerContentRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAnchorRef.current) {
      const parent = answerContentRef.current;
      if (parent) {
        const isScrolledToBottom = parent.scrollHeight - parent.clientHeight <= parent.scrollTop + 2;
        if (isScrolledToBottom) {
          scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    }
  }, [followUpHistory, isThinkingFollowUp]);

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

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim()) return;

    const currentQuery = followUp;
    setFollowUp("");
    const newHistory = [...followUpHistory, { query: currentQuery, answer: '' }];
    setFollowUpHistory(newHistory);
    setIsThinkingFollowUp(true);

    try {
      // TODO: Integrate with AI agent for follow-up queries
      // For now, simulate a response
      setTimeout(() => {
        const updatedHistory = newHistory.map(h =>
          h.query === currentQuery
            ? { ...h, answer: "This is a simulated follow-up response. AI integration pending." }
            : h
        );
        setFollowUpHistory(updatedHistory);
        setIsThinkingFollowUp(false);
      }, 1000);
    } catch (error) {
      console.error("Follow-up AI error:", error);
      const updatedHistory = newHistory.map(h =>
        h.query === currentQuery
          ? { ...h, answer: "Sorry, couldn't process that follow-up question." }
          : h
      );
      setFollowUpHistory(updatedHistory);
      setIsThinkingFollowUp(false);
    }
  };

  const renderCitations = (html: string) => {
    if (!config.props.citations) return html;

    return html.replace(/<sup[^>]*data-cite=['"]([^'"]+)['"][^>]*>(.*?)<\/sup>/g, (match, citeId, content) => {
      const citation = config.props.citations?.find(c => c.id === citeId);
      if (!citation) return match;

      return `<sup class="cursor-pointer text-primary hover:text-primary/80" title="${citation.title}: ${citation.snippet}">[${content}]</sup>`;
    });
  };

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

        <div className="flex flex-col flex-grow min-h-0">
          {/* Toggle Button */}
          <div className="px-4 py-2 border-b border-white/10 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseStreamingChat(!useStreamingChat)}
              className="text-xs text-muted-foreground hover:text-white"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              {useStreamingChat ? 'Static View' : 'Interactive Chat'}
            </Button>
          </div>

          {useStreamingChat ? (
            /* Streaming Chat Interface */
            <StreamingChat
              messages={chatMessages}
              sendMessage={sendMessage}
              status={status}
              error={error || null}
              initialMessage={config.props.html}
            />
          ) : (
            /* Legacy Follow-up Interface */
            <>
              <div className="flex-grow overflow-y-auto p-4" ref={answerContentRef}>
                <div className="space-y-4">
                  <div
                    className="text-sm leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderCitations(config.props.html) }}
                  />

                  {followUpHistory.length > 0 && <div className="border-t border-white/10 pt-4" />}
                  {followUpHistory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <p className="font-code text-xs font-semibold text-muted-foreground">{item.query}</p>
                      <p className="text-sm">{item.answer}</p>
                    </div>
                  ))}

                  {isThinkingFollowUp && (
                    <Loader2 className="mt-4 h-5 w-5 animate-spin text-primary" />
                  )}
                  <div ref={scrollAnchorRef} />
                </div>
              </div>

              <div className="p-3 border-t flex-shrink-0">
                <form onSubmit={handleFollowUpSubmit} className="relative">
                  <Input
                    type="text"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Wanna dig deeper?"
                    className="h-10 rounded-md bg-neutral-800/80 pr-12 text-sm focus:border-primary"
                    disabled={isThinkingFollowUp}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-primary/20 text-primary-foreground hover:bg-primary/30"
                    disabled={isThinkingFollowUp}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize z-10"
        onMouseDown={handleMouseDownResize}
      />
    </div>
  );
}