"use client";

import { AppSidebar } from "@/components/layout/sidebar";
import { QueryBar } from "@/components/query-bar";
import { ConversationStarters } from "@/components/conversation-starters";
import { KnowledgePanel } from "@/components/knowledge-panel";
import React, { useState, useEffect } from "react";
import { generateConciseSummary } from "@/ai/flows/generate-concise-summary";
import { MinimizedPanel } from "@/components/minimized-panel";

export interface PanelData {
  id: string;
  query: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
}

export default function Home() {
  const [panels, setPanels] = useState<PanelData[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const bringToFront = (id: string) => {
    setPanels(prevPanels => {
      if (prevPanels.length <= 1) return prevPanels;
      const maxZ = Math.max(...prevPanels.map(p => p.zIndex));
      const currentPanel = prevPanels.find(p => p.id === id);
      if (currentPanel && currentPanel.zIndex === maxZ) return prevPanels;
      
      return prevPanels.map(p =>
        p.id === id ? { ...p, zIndex: maxZ + 1 } : p
      );
    });
  };

  const handleQuery = async (query: string) => {
    if (!isClient) return;
    const newId = `panel-${Date.now()}`;
    const maxZ = panels.length > 0 ? Math.max(...panels.map(p => p.zIndex)) : 0;
    
    const newPanelPlaceholder: PanelData = {
      id: newId,
      query,
      summary: "Thinking...",
      position: { x: window.innerWidth / 2 - 275 + (Math.random() - 0.5) * 100, y: window.innerHeight / 2 - 300 + (Math.random() - 0.5) * 100 },
      size: { width: 550, height: 600 },
      zIndex: maxZ + 1,
      isMinimized: false,
    };
    setPanels(prev => [...prev, newPanelPlaceholder]);

    try {
      const result = await generateConciseSummary({ searchResults: `Information about ${query}` });
      setPanels(prev => prev.map(p => p.id === newId ? { ...p, summary: result.summary } : p));
    } catch (error) {
      console.error("AI Error:", error);
      setPanels(prev => prev.map(p => p.id === newId ? { ...p, summary: "Sorry, couldn't fetch that." } : p));
    }
  };

  const closePanel = (id: string) => {
    setPanels(panels.filter(p => p.id !== id));
  };

  const toggleMinimizePanel = (id: string) => {
    setPanels(prev => prev.map(p => {
      if (p.id === id) {
        const isMinimized = !p.isMinimized;
        if (!isMinimized) {
          // If we are restoring the panel, bring it to front.
          const maxZ = Math.max(...prev.map(p => p.zIndex));
          return { ...p, isMinimized: false, zIndex: maxZ + 1 };
        }
        return { ...p, isMinimized: true };
      }
      return p;
    }));
  };
  
  const updatePanelPosition = (id: string, position: { x: number; y: number }) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, position } : p));
  };
  
  const updatePanelSize = (id: string, size: { width: number; height: number }) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, size } : p));
  };
  
  const minimizedPanels = panels.filter(p => p.isMinimized);
  const openPanels = panels.filter(p => !p.isMinimized);

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="h-full pl-20">
        <div className="relative flex h-full flex-col p-6">
          <div className="flex-grow transition-opacity duration-500" style={{ opacity: panels.length > 0 ? 0 : 1 }}>
            <div className="flex flex-col items-center justify-center h-full text-center -mt-24">
              <h1 className="text-5xl font-headline font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400">
                G'day! What's the go?
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Your AI-powered research space for all things Australia.
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-10 space-y-6">
             <div className="transition-opacity duration-500" style={{ opacity: panels.length > 0 ? 0 : 1, pointerEvents: panels.length > 0 ? 'none' : 'auto' }}>
                {isClient && <ConversationStarters onQuery={handleQuery} />}
             </div>
             <QueryBar onQuery={handleQuery} />
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 pl-20 pointer-events-none">
        {isClient && openPanels.map(panel => (
          <div key={panel.id} className="pointer-events-auto">
            <KnowledgePanel
              panelData={panel}
              onClose={closePanel}
              onFocus={bringToFront}
              onPositionChange={updatePanelPosition}
              onSizeChange={updatePanelSize}
              onToggleMinimize={toggleMinimizePanel}
            />
          </div>
        ))}
      </div>
      
      {minimizedPanels.length > 0 && (
        <div className="absolute top-0 left-20 right-0 h-16 bg-black/10 backdrop-blur-md p-2 flex items-center gap-2 overflow-x-auto z-50">
          {minimizedPanels.map(panel => (
            <MinimizedPanel key={panel.id} panelData={panel} onRestore={() => toggleMinimizePanel(panel.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
