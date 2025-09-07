/**
 * Karta Enhanced Page - Customizable Version
 *
 * This page is an exact replica of the main Morphic page (app/page.tsx) and serves as
 * a working copy for extending and enhancing with advanced AI agent capabilities.
 *
 * The original app/page.tsx remains untouched as a reference.
 *
 * This version can be enhanced with:
 * - Backend agent API integration
 * - Advanced AI features from the LangChain template
 * - Panel-based UI components
 * - Web scraping capabilities
 * - Multi-model support
 */

"use client";

import React, { useState } from 'react';

import { PanelRenderer } from "@/components/panels/panel-renderer";

// Extend window type for panel API
declare global {
  interface Window {
    panelAPI?: {
      createPanel: (type: string, title: string, props: any) => string;
      updatePanel: (id: string, updates: any) => void;
      closePanel: (id: string) => void;
      minimizePanel: (id: string) => void;
      focusPanel: (id: string) => void;
    };
  }
}

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const [query, setQuery] = useState("");
  const [models, setModels] = useState<any[]>([]);

  React.useEffect(() => {
    setIsClient(true);

    // Load models client-side
    const loadModels = async () => {
      try {
        const response = await fetch('/config/models.json');
        if (response.ok) {
          const config = await response.json();
          if (config.models && Array.isArray(config.models)) {
            setModels(config.models.filter((model: any) => model.enabled));
          }
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };
    loadModels();
  }, []);

  const handleQuery = async (queryText: string) => {
    if (!isClient || !queryText.trim()) return;

    // Create PRIME panel immediately
    if (window.panelAPI) {
      window.panelAPI.createPanel('PRIME', queryText, {
        query: queryText,
        models: models // Pass loaded models to panel
      });
    }
    setQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(query);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <div className="h-full">
        <div className="relative flex h-full flex-col p-6">
          <div className="flex flex-col items-center justify-center h-full text-center -mt-24">
            <h1 className="text-5xl font-headline font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400">
              Karta AI Enhanced
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Your AI-powered research space with advanced panel system.
            </p>

            {/* Simple test input */}
            <div className="mt-8 w-full max-w-md">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your query..."
                  className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ask
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Panel System */}
      {isClient && <PanelRenderer />}
    </main>
  );
}