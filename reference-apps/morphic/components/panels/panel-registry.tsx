import React from 'react';

import { ChatPanel } from './types/chat-panel';
import { PrimePanel } from './types/prime-panel';
import { ShoppingPanel } from './types/shopping-panel';
// import { AnswerPanel } from './types/answer-panel';
// import { SourcesPanel } from './types/sources-panel';
// import { ImagesPanel } from './types/images-panel';

export type PanelType =
  | 'PRIME'
  | 'CHAT_PANEL'
  | 'ANSWER'
  | 'SOURCES'
  | 'IMAGES'
  | 'SHOPPING';

export interface BasePanelConfig {
  type: PanelType;
  title: string;
  props: Record<string, any>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  zIndex?: number;
  isMinimized?: boolean;
  isPinned?: boolean;
}

export type PanelConfig = BasePanelConfig & {
  type: PanelType;
};

export interface PanelComponentProps<T extends PanelConfig = PanelConfig> {
  id: string;
  config: T;
  onUpdate: (updates: Partial<T>) => void;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
}

const panelComponents: Record<PanelType, React.ComponentType<any>> = {
  PRIME: PrimePanel,
  CHAT_PANEL: ChatPanel,
  ANSWER: null as any, // TODO: Implement
  SOURCES: null as any, // TODO: Implement
  IMAGES: null as any, // TODO: Implement
  SHOPPING: ShoppingPanel,
};

export class PanelRegistry {
  static getPanelComponent(type: PanelType): React.ComponentType<any> | null {
    return panelComponents[type] || null;
  }

  static getAllPanelTypes(): PanelType[] {
    return Object.keys(panelComponents) as PanelType[];
  }

  static createPanelConfig(
    type: PanelType,
    title: string,
    props: Record<string, any>,
    options?: Partial<Omit<BasePanelConfig, 'type' | 'title' | 'props'>>
  ): PanelConfig {
    return {
      type,
      title,
      props,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      size: { width: 550, height: 600 },
      zIndex: 1,
      isMinimized: false,
      isPinned: false,
      ...options,
    };
  }

  static validatePanelConfig(config: PanelConfig): boolean {
    if (!config.type || !config.title) return false;
    if (!this.getPanelComponent(config.type)) return false;
    return true;
  }
}