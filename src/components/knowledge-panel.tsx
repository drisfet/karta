"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pin, Expand, X, ArrowUp, Loader2, Minus, FileText, Image as ImageIcon, Link as LinkIcon, ListChecks } from "lucide-react";
import type { PanelData } from "@/app/page";
import { contextAwareFollowUpQueries } from '@/ai/flows/context-aware-follow-up-queries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

interface KnowledgePanelProps {
  panelData: PanelData;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
  onToggleMinimize: (id: string) => void;
}

export function KnowledgePanel({ panelData, onClose, onFocus, onPositionChange, onSizeChange, onToggleMinimize }: KnowledgePanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [followUpHistory, setFollowUpHistory] = useState<{ query: string, answer: string }[]>([]);
  const [isThinkingFollowUp, setIsThinkingFollowUp] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, [role="tab"]')) return;
    onFocus(panelData.id);
    setIsDragging(true);
    const panelRect = panelRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - panelRect.left, y: e.clientY - panelRect.top };
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseDownResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFocus(panelData.id);
    setIsResizing(true);
    document.body.style.cursor = 'se-resize';
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onPositionChange(panelData.id, { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    }
    if (isResizing) {
      const panelRect = panelRef.current!.getBoundingClientRect();
      const newWidth = Math.max(400, e.clientX - panelRect.left + 8);
      const newHeight = Math.max(300, e.clientY - panelRect.top + 8);
      onSizeChange(panelData.id, { width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, panelData.id, onPositionChange, onSizeChange]);

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
      setIsThinkingFollowUp(true);

      try {
        const result = await contextAwareFollowUpQueries({
          originalQuery: panelData.query,
          followUpQuery: currentQuery,
          knowledgePanelContent: panelData.summary + "\n" + followUpHistory.map(h => `Q: ${h.query}\nA: ${h.answer}`).join("\n"),
        });
        setFollowUpHistory(prev => [...prev, { query: currentQuery, answer: result.answer }]);
      } catch (error) {
        console.error("Follow-up AI error:", error);
        setFollowUpHistory(prev => [...prev, { query: currentQuery, answer: "I couldn't process that, mate. Try again." }]);
      } finally {
        setIsThinkingFollowUp(false);
      }
  };
  
  const renderContent = () => {
    if (panelData.isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <Tabs defaultValue="answer" className="flex flex-col flex-grow">
        <TabsList className="mx-4 mt-2 bg-transparent p-0 border-b border-white/10 rounded-none justify-start gap-4">
          <TabsTrigger value="answer" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-2 text-muted-foreground"><FileText className="mr-2" /> Answer</TabsTrigger>
          {panelData.images && panelData.images.length > 0 && <TabsTrigger value="images" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-2 text-muted-foreground"><ImageIcon className="mr-2" /> Images</TabsTrigger>}
          {panelData.sources && panelData.sources.length > 0 && <TabsTrigger value="sources" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-2 text-muted-foreground"><LinkIcon className="mr-2" /> Sources</TabsTrigger>}
          {panelData.steps && panelData.steps.length > 0 && <TabsTrigger value="steps" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-2 text-muted-foreground"><ListChecks className="mr-2" /> Steps</TabsTrigger>}
        </TabsList>
        <div className="flex-grow overflow-y-auto">
          <TabsContent value="answer" className="p-4 mt-0">
            <div className="space-y-4">
                <p className="text-sm leading-relaxed">{panelData.summary}</p>
                {followUpHistory.length > 0 && <div className="border-t border-white/10 pt-4" />}
                {followUpHistory.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <p className="font-code text-xs font-semibold text-muted-foreground">{item.query}</p>
                    <p className="text-sm">{item.answer}</p>
                  </div>
                ))}
                {isThinkingFollowUp && <Loader2 className="mt-4 h-5 w-5 animate-spin text-primary" />}
            </div>
          </TabsContent>
          <TabsContent value="images" className="p-4 mt-0">
            <div className="grid grid-cols-2 gap-4">
              {panelData.images?.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={image.url} alt={image.alt} fill className="object-cover" data-ai-hint={image.aiHint} sizes="(max-width: 768px) 50vw, 33vw" />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sources" className="p-4 mt-0">
            <div className="space-y-3">
              {panelData.sources?.map((source, index) => (
                <a key={index} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                  <Image src={source.favicon} alt="" width={16} height={16} className="flex-shrink-0" />
                  <span className="text-sm truncate text-muted-foreground hover:text-white">{source.title}</span>
                </a>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="steps" className="p-4 mt-0">
            <ol className="list-decimal list-inside space-y-2 text-sm">
                {panelData.steps?.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ol>
          </TabsContent>
        </div>
      </Tabs>
    )
  }

  return (
    <div
      ref={panelRef}
      className="absolute flex flex-col rounded-xl shadow-2xl shadow-black/50 transition-shadow duration-300"
      style={{
        left: `${panelData.position.x}px`,
        top: `${panelData.position.y}px`,
        width: `${panelData.size.width}px`,
        height: `${panelData.size.height}px`,
        zIndex: panelData.zIndex,
        boxShadow: `0 0 20px 0 hsl(var(--primary) / 0.3), 0 25px 50px -12px rgb(0 0 0 / 0.5)`
      }}
      onMouseDown={() => onFocus(panelData.id)}
    >
      <div className="flex-grow rounded-xl border border-primary/30 bg-neutral-900/60 backdrop-blur-xl flex flex-col overflow-hidden">
        <CardHeader
          className="flex-row items-center justify-between p-3 border-b cursor-grab"
          onMouseDown={handleMouseDownDrag}
        >
          <p className="font-code text-xs font-medium truncate select-none">{panelData.query}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7"><Pin className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Expand className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleMinimize(panelData.id)}><Minus className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onClose(panelData.id)}><X className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        
        <div className="flex flex-col flex-grow min-h-0">
            {renderContent()}

            <div className="p-3 border-t mt-auto">
                <form onSubmit={handleFollowUpSubmit} className="relative">
                    <Input
                        type="text"
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                        placeholder="Wanna dig deeper?"
                        className="h-10 rounded-md bg-neutral-800/80 pr-12 text-sm focus:border-primary"
                        disabled={isThinkingFollowUp || panelData.isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-primary/20 text-primary-foreground hover:bg-primary/30"
                        disabled={isThinkingFollowUp || panelData.isLoading}
                    >
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                </form>
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
