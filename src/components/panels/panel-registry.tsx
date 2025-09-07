import React from 'react';
import { AnswerPanel } from './types/answer-panel';
import { SourcesPanel } from './types/sources-panel';
import { PrimePanel } from './types/prime-panel';
// import { ImagesPanel } from './types/images-panel';
// import { ChartPanel } from './types/chart-panel';
// import { MapPanel } from './types/map-panel';
import { ShopPanel } from './types/shop-panel';
// import { NotesPanel } from './types/notes-panel';
// import { DocViewerPanel } from './types/doc-viewer-panel';

export type PanelType =
  | 'ANSWER'
  | 'SOURCES'
  | 'PRIME'
  | 'IMAGES'
  | 'CHART'
  | 'MAP'
  | 'SHOPPING'
  | 'NOTES'
  | 'DOC_VIEWER';

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
  ANSWER: AnswerPanel,
  SOURCES: SourcesPanel,
  PRIME: PrimePanel,
  IMAGES: null as any, // TODO: Implement
  CHART: null as any, // TODO: Implement
  MAP: null as any, // TODO: Implement
  SHOPPING: ShopPanel,
  NOTES: null as any, // TODO: Implement
  DOC_VIEWER: null as any, // TODO: Implement
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