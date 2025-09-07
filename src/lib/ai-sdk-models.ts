import { createOpenAI } from '@ai-sdk/openai';
import { openai } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { chatModels } from './models';

// Initialize Google provider
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// OpenRouter provider for AI SDK
const openrouter = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
});

export type AIModelProvider = 'google' | 'openrouter';

export class AISDKModelProvider {
  static createModel(modelId: string) {
    // Check if it's a Google Gemini model
    if (modelId.startsWith('gemini')) {
      return googleProvider(modelId);
    }

    // Check if it's an OpenRouter model
    if (modelId.includes('/') || modelId.includes('openrouter')) {
      // Clean up the model ID for OpenRouter
      const cleanModelId = modelId.replace('openrouter/', '');
      return openrouter.chat(cleanModelId);
    }

    // Fallback to OpenAI (though we shouldn't reach here with current models)
    return openai.chat(modelId);
  }

  static getProviderType(modelId: string): AIModelProvider {
    if (modelId.startsWith('gemini')) {
      return 'google';
    }
    return 'openrouter';
  }

  static validateModel(modelId: string): boolean {
    const model = chatModels.find(m => m.id === modelId);
    return !!model;
  }

  static getAvailableModels() {
    return chatModels;
  }
}

// Export the providers for direct use
export { openrouter };
export { googleProvider as google };