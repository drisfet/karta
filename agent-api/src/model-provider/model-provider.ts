import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export type ModelType = 'google' | 'openrouter'; // OpenAI disabled

export class ModelProvider {
  static createModel(type: ModelType, modelName?: string) {
    switch (type) {
      case 'google':
        return new ChatGoogleGenerativeAI({
          modelName: modelName || 'gemini-1.5-flash',
          apiKey: process.env.GOOGLE_API_KEY,
        });
      case 'openrouter':
        // OpenRouter uses OpenAI-compatible API but with different base URL
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        console.log('🔑 OpenRouter API Key:', openRouterKey ? `${openRouterKey.substring(0, 10)}...` : 'NOT SET');

        if (!openRouterKey || openRouterKey === 'your-openrouter-api-key') {
          throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env');
        }

        // Available free models on OpenRouter
        const availableModels = {
          'glm': 'z-ai/glm-4.5-air:free',
          'deepseek': 'deepseek/deepseek-chat-v3.1:free',
          'wizard': 'microsoft/wizardlm-2-8x22b'
        };

        // Default to GLM model (free and good performance)
        const defaultModel = availableModels.glm;

        return new ChatOpenAI({
          modelName: modelName || defaultModel,
          openAIApiKey: openRouterKey,
          configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
              'HTTP-Referer': 'https://karta.vercel.app',
              'X-Title': 'Karta',
            },
          },
        });
      default:
        throw new Error(`Unsupported model type: ${type}`);
    }
  }
}