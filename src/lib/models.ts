import { Zap, Rocket, Bot, MessageSquare } from "lucide-react";

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: 'Google' | 'OpenRouter';
  icon: React.ComponentType<{ className?: string }>;
}

export const chatModels: ModelInfo[] = [
  // Gemini Models
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Fast chat responses",
    provider: "Google",
    icon: Zap
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Advanced reasoning",
    provider: "Google",
    icon: Rocket
  },
  {
    id: "gemini-1.0-pro",
    name: "Gemini 1.0 Pro",
    description: "Stable performance",
    provider: "Google",
    icon: Bot
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description: "Balanced capability",
    provider: "Google",
    icon: Rocket
  },
  {
    id: "gemini-pro-vision",
    name: "Gemini Pro Vision",
    description: "Image understanding",
    provider: "Google",
    icon: Zap
  },

  // OpenRouter Free Models
  {
    id: "openrouter/sonoma-dusk-alpha",
    name: "Sonoma Dusk Alpha",
    description: "Creative writing & reasoning",
    provider: "OpenRouter",
    icon: MessageSquare
  },
  {
    id: "nousresearch/deephermes-3-llama-3-8b-preview:free",
    name: "DeepHermes 3 Llama",
    description: "Advanced Llama model",
    provider: "OpenRouter",
    icon: MessageSquare
  },
  {
    id: "arliai/qwq-32b-arliai-rpr-v1:free",
    name: "QWQ 32B ArliAI",
    description: "Large reasoning model",
    provider: "OpenRouter",
    icon: MessageSquare
  },
  {
    id: "deepseek/deepseek-chat-v3.1:free",
    name: "DeepSeek Chat v3.1",
    description: "Efficient chat model",
    provider: "OpenRouter",
    icon: MessageSquare
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS 20B",
    description: "Open-source GPT model",
    provider: "OpenRouter",
    icon: MessageSquare
  },
  {
    id: "z-ai/glm-4.5-air:free",
    name: "GLM-4.5-Air",
    description: "Air-optimized GLM",
    provider: "OpenRouter",
    icon: MessageSquare
  },
  {
    id: "google/gemma-3n-e2b-it:free",
    name: "Gemma 3N E2B",
    description: "Efficient Gemma model",
    provider: "OpenRouter",
    icon: MessageSquare
  },
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Dolphin Mistral 24B",
    description: "Fine-tuned Mistral",
    provider: "OpenRouter",
    icon: MessageSquare
  },
];

export function getModelDisplayName(modelId: string): string {
  const model = chatModels.find(m => m.id === modelId);
  return model?.name || modelId;
}

export function getModelProvider(modelId: string): 'Google' | 'OpenRouter' | 'Unknown' {
  const model = chatModels.find(m => m.id === modelId);
  return model?.provider || 'Unknown';
}

export function getProviderColor(modelId: string): string {
  const provider = getModelProvider(modelId);
  return provider === 'OpenRouter' ? 'text-green-400' : provider === 'Google' ? 'text-blue-400' : 'text-gray-400';
}

export function isOpenRouterModel(modelId: string): boolean {
  return modelId.startsWith('openrouter/') || (modelId.includes('/') && !modelId.startsWith('gemini'));
}