import React, { useState, useCallback } from 'react';
import { PanelRegistry, PanelConfig, PanelType } from './panel-registry';
import { MinimizedPanel } from '../minimized-panel';
import { nanoid } from 'nanoid';

interface PanelInstance extends PanelConfig {
  id: string;
  isMinimized: boolean;
}

interface PanelRendererProps {
  onPanelUpdate?: (panelId: string, updates: Partial<PanelConfig>) => void;
  onPanelClose?: (panelId: string) => void;
}

export function PanelRenderer({ onPanelUpdate, onPanelClose }: PanelRendererProps) {
  const [panels, setPanels] = useState<PanelInstance[]>([]);

  const bringToFront = useCallback((id: string) => {
    setPanels(prevPanels => {
      if (prevPanels.length <= 1) return prevPanels;
      const maxZ = Math.max(...prevPanels.map(p => p.zIndex || 1));
      const currentPanel = prevPanels.find(p => p.id === id);
      if (currentPanel && (currentPanel.zIndex || 1) === maxZ) return prevPanels;

      return prevPanels.map(p =>
        p.id === id ? { ...p, zIndex: maxZ + 1 } : p
      );
    });
  }, []);

  const handlePanelUpdate = useCallback((id: string, updates: Partial<PanelConfig>) => {
    setPanels(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ));
    onPanelUpdate?.(id, updates);
  }, [onPanelUpdate]);

  const handlePanelClose = useCallback((id: string) => {
    setPanels(prev => prev.filter(p => p.id !== id));
    onPanelClose?.(id);
  }, [onPanelClose]);

  const handlePanelMinimize = useCallback((id: string) => {
    setPanels(prev => prev.map(p => {
      if (p.id === id) {
        const isMinimized = !p.isMinimized;
        if (!isMinimized) {
          // If we are restoring the panel, bring it to front.
          const maxZ = Math.max(...prev.map(p => p.zIndex || 1));
          return { ...p, isMinimized: false, zIndex: maxZ + 1 };
        }
        return { ...p, isMinimized: true };
      }
      return p;
    }));
  }, []);

  const handlePanelFocus = useCallback((id: string) => {
    bringToFront(id);
  }, [bringToFront]);

  const handlePositionChange = useCallback((id: string, position: { x: number; y: number }) => {
    handlePanelUpdate(id, { position });
  }, [handlePanelUpdate]);

  const handleSizeChange = useCallback((id: string, size: { width: number; height: number }) => {
    handlePanelUpdate(id, { size });
  }, [handlePanelUpdate]);

  // Public API for LangChain agents to manipulate panels
  const createPanel = useCallback((type: PanelType, title: string, props: Record<string, any>, options?: Partial<PanelConfig>) => {
    const config = PanelRegistry.createPanelConfig(type, title, props, options);
    const newPanel: PanelInstance = {
      ...config,
      id: nanoid(),
      isMinimized: false,
    };

    setPanels(prev => [...prev, newPanel]);
    return newPanel.id;
  }, []);

  const updatePanel = useCallback((id: string, updates: Partial<PanelConfig>) => {
    handlePanelUpdate(id, updates);
  }, [handlePanelUpdate]);

  const closePanel = useCallback((id: string) => {
    handlePanelClose(id);
  }, [handlePanelClose]);

  const minimizePanel = useCallback((id: string) => {
    handlePanelMinimize(id);
  }, [handlePanelMinimize]);

  const focusPanel = useCallback((id: string) => {
    handlePanelFocus(id);
  }, [handlePanelFocus]);

  // Expose API for LangChain agents
  React.useEffect(() => {
    // Make panel manipulation functions available globally for LangChain agents
    (window as any).panelAPI = {
      createPanel,
      updatePanel,
      closePanel,
      minimizePanel,
      focusPanel,
    };
  }, [createPanel, updatePanel, closePanel, minimizePanel, focusPanel]);

  const minimizedPanels = panels.filter(p => p.isMinimized);
  const openPanels = panels.filter(p => !p.isMinimized);

  return (
    <>
      {/* Open Panels */}
      <div className="absolute inset-0 pl-20 pointer-events-none">
        {openPanels.map(panel => {
          const PanelComponent = PanelRegistry.getPanelComponent(panel.type);
          if (!PanelComponent) return null;

          return (
            <div key={panel.id} className="pointer-events-auto">
              <PanelComponent
                key={`${panel.id}-${JSON.stringify(panel.props)}`}
                id={panel.id}
                config={panel}
                onUpdate={(updates: Partial<PanelConfig>) => handlePanelUpdate(panel.id, updates)}
                onClose={() => handlePanelClose(panel.id)}
                onFocus={() => handlePanelFocus(panel.id)}
                onMinimize={() => handlePanelMinimize(panel.id)}
                onPositionChange={(position: { x: number; y: number }) => handlePositionChange(panel.id, position)}
                onSizeChange={(size: { width: number; height: number }) => handleSizeChange(panel.id, size)}
              />
            </div>
          );
        })}
      </div>

      {/* Minimized Panels Bar */}
      {minimizedPanels.length > 0 && (
        <div className="absolute top-0 left-20 right-0 h-16 bg-black/10 backdrop-blur-md p-2 flex items-center gap-2 overflow-x-auto z-50">
          {minimizedPanels.map(panel => (
            <MinimizedPanel
              key={panel.id}
              panelData={{
                id: panel.id,
                query: panel.title,
                summary: '',
                images: [],
                sources: [],
                steps: [],
                position: panel.position || { x: 0, y: 0 },
                size: panel.size || { width: 550, height: 600 },
                zIndex: panel.zIndex || 1,
                isMinimized: true,
                isLoading: false,
              }}
              onRestore={() => handlePanelMinimize(panel.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

// Export the panel API type for LangChain agents
export interface PanelAPI {
  createPanel: (type: PanelType, title: string, props: Record<string, any>, options?: Partial<PanelConfig>) => string;
  updatePanel: (id: string, updates: Partial<PanelConfig>) => void;
  closePanel: (id: string) => void;
  minimizePanel: (id: string) => void;
  focusPanel: (id: string) => void;
}