"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface ModelContextType {
  selectedModel: string | null;
  setSelectedModel: (model: string) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ChatModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useChatModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useChatModel must be used within a ChatModelProvider');
  }
  return context;
}