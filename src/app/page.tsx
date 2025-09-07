"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { QueryBar } from "@/components/query-bar/query-bar";
import { ConversationStarters } from "@/components/conversation-starters";
import { PanelRenderer } from "@/components/panels/panel-renderer";
import { searchQuery } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Server } from "lucide-react";

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

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleQuery = async (query: string, retryCount = 0) => {
    if (!isClient) return;

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    // Create PRIME panel immediately with loading state
    let primePanelId: string | null = null;
    if (window.panelAPI) {
      primePanelId = window.panelAPI.createPanel('PRIME', query, {
        summary: '', // Empty initially
        images: [],
        sources: [],
        steps: [],
        citations: [],
        followUpHistory: [],
        isLoading: true, // Add loading state
        error: null,
        retryCount: 0
      });
    }

    const attemptRequest = async (): Promise<any> => {
      if (query.toLowerCase().includes('cheapest') || query.toLowerCase().includes('shop')) {
        // For shop queries, use the shop endpoint
        const response = await fetch('/api/shop/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        return response.json();
      } else {
        // Use main search API for all other queries
        return await searchQuery({ query });
      }
    };

    try {
      const result = await attemptRequest();

      // Update PRIME panel with real data
      if (window.panelAPI && primePanelId && result) {
        window.panelAPI.updatePanel(primePanelId, {
          props: {
            summary: result.answerHtml || 'No summary available',
            images: [], // Will be populated from backend when available
            sources: result.citations?.map((citation: any) => ({
              url: citation.url,
              title: citation.title,
              favicon: citation.favicon || '/favicon.ico'
            })) || [],
            steps: [], // Will be populated from backend when available
            citations: result.citations || [],
            followUpHistory: [],
            isLoading: false,
            error: null,
            retryCount: 0
          }
        });
      }

      // Handle additional UI_INTENTS from backend (like SOURCES panel)
      if (result?.ui_intents?.length > 0) {
        result.ui_intents.forEach((intent: any) => {
          if (intent.type === 'OPEN_PANEL' && intent.panel !== 'ANSWER') {
            // Create other panels (like SOURCES) but skip ANSWER since we already created PRIME
            if (window.panelAPI) {
              window.panelAPI.createPanel(
                intent.panel as any,
                intent.props.title || query,
                intent.props
              );
            }
          }
        });
      }
    } catch (error: any) {
      console.error("API Error:", error);

      // Check if backend server is down
      const isBackendDown = error.message === 'BACKEND_SERVER_DOWN';
      const isBackendTimeout = error.message === 'BACKEND_TIMEOUT';

      if (isBackendDown) {
        // Show high-fidelity toast notification
        toast({
          title: "Backend Server Unavailable",
          description: "The backend agent API server is not running. Please start the server and try again.",
          variant: "destructive",
          duration: 8000 // Show for 8 seconds
        });

        // Update panel with server-specific error
        if (window.panelAPI && primePanelId) {
          window.panelAPI.updatePanel(primePanelId, {
            props: {
              summary: `<div class="text-center p-4">
                <div class="flex items-center justify-center mb-4">
                  <div class="p-3 bg-red-500/20 rounded-full">
                    <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                    </svg>
                  </div>
                </div>
                <div class="text-red-400 mb-2 font-semibold">Backend Server Not Running</div>
                <div class="text-sm text-muted-foreground mb-4">
                  The agent API server needs to be started to process your queries.
                </div>
                <div class="text-xs text-muted-foreground">
                  Check the server logs for more details.
                </div>
              </div>`,
              isLoading: false,
              error: 'Backend server is not running',
              retryCount: retryCount
            }
          });
        }
        return;
      }

      if (isBackendTimeout) {
        // Show timeout-specific toast notification
        toast({
          title: "Request Timeout",
          description: "The server is taking too long to respond. This might be due to high load or connectivity issues.",
          variant: "destructive",
          duration: 6000 // Show for 6 seconds
        });

        // Update panel with timeout-specific error
        if (window.panelAPI && primePanelId) {
          window.panelAPI.updatePanel(primePanelId, {
            props: {
              summary: `<div class="text-center p-4">
                <div class="flex items-center justify-center mb-4">
                  <div class="p-3 bg-orange-500/20 rounded-full">
                    <svg class="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="text-orange-400 mb-2 font-semibold">Request Timeout</div>
                <div class="text-sm text-muted-foreground mb-4">
                  The server is taking too long to respond. This might be due to high load.
                </div>
                <div class="text-xs text-muted-foreground">
                  The request will be retried automatically.
                </div>
              </div>`,
              isLoading: false,
              error: 'Request timeout',
              retryCount: retryCount
            }
          });
        }
        return;
      }

      const isNetworkError = error.name === 'TypeError' || error.message?.includes('fetch');
      const isTimeoutError = error.name === 'TimeoutError' || error.message?.includes('timeout') || error.message === 'BACKEND_TIMEOUT';
      const isServerError = error.message?.includes('504') || error.message?.includes('502');

      if ((isNetworkError || isTimeoutError || isServerError) && retryCount < MAX_RETRIES) {
        console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);

        // Update panel to show retry state
        if (window.panelAPI && primePanelId) {
          window.panelAPI.updatePanel(primePanelId, {
            props: {
              summary: '',
              isLoading: true,
              error: `Connection issue. Retrying... (${retryCount + 1}/${MAX_RETRIES})`,
              retryCount: retryCount + 1
            }
          });
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return handleQuery(query, retryCount + 1);
      }

      // Final error - no more retries
      const errorMessage = isNetworkError
        ? 'Network connection issue. Please check your internet connection and try again.'
        : isTimeoutError
        ? 'Request timed out. The server is taking too long to respond. Please try again.'
        : isServerError
        ? 'Server is temporarily unavailable. Please try again in a moment.'
        : 'An unexpected error occurred. Please try again.';

      // Update PRIME panel with error state
      if (window.panelAPI && primePanelId) {
        window.panelAPI.updatePanel(primePanelId, {
          props: {
            summary: `<div class="text-center p-4">
              <div class="text-red-400 mb-2">⚠️ ${errorMessage}</div>
              <div class="text-sm text-muted-foreground mt-2">
                Click the query bar above to try again with the same query.
              </div>
            </div>`,
            isLoading: false,
            error: errorMessage,
            retryCount: retryCount
          }
        });
      }
    }
  };

  const showMainContent = true; // Always show main content for now

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="h-full pl-20">
        <div className="relative flex h-full flex-col p-6">
          <div className="flex-grow transition-opacity duration-500" style={{ opacity: showMainContent ? 1 : 0 }}>
            <div className="flex flex-col items-center justify-center h-full text-center -mt-24">
              <h1 className="text-5xl font-headline font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400">
                G'day! What's the go?
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Your AI-powered research space for all things Australia.
              </p>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-10 space-y-4">
              <div className="transition-opacity duration-500" style={{ opacity: showMainContent ? 1 : 0, pointerEvents: showMainContent ? 'auto' : 'none' }}>
                {isClient && <ConversationStarters onQuery={handleQuery} />}
              </div>
              <QueryBar onQuery={handleQuery} />
            </div>
        </div>
      </div>

      {/* New LangChain-powered Panel System */}
      {isClient && <PanelRenderer />}
    </main>
  );
}
