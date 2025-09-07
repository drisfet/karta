import { ModelProvider, ModelType } from '../model-provider/model-provider';
import { RetrievedData } from '../retriever/retriever';

export interface SynthesisResult {
  html: string;
  citations: Array<{
    id: string;
    title: string;
    url: string;
    snippet: string;
    favicon?: string;
  }>;
  items?: Array<{
    name: string;
    price: number;
    url: string;
  }>;
}

export class Synthesizer {
  private model: any;

  constructor(modelType?: ModelType) {
    // Auto-detect available API keys and choose appropriate model
    if (!modelType) {
      modelType = this.detectAvailableModel();
    }

    // Handle any invalid model types by falling back to OpenRouter
    const validTypes: ModelType[] = ['google', 'openrouter'];
    if (!validTypes.includes(modelType)) {
      console.log(`⚠️  Invalid model type: ${modelType}, falling back to OpenRouter`);
      modelType = 'openrouter';
    }

    this.model = ModelProvider.createModel(modelType);
  }

  private detectAvailableModel(): ModelType {
    // Check for available API keys in order of preference
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your-openrouter-api-key') {
      console.log('🤖 Using OpenRouter (available API key detected)');
      console.log('📋 Available models: GLM-4.5, DeepSeek, WizardLM');
      return 'openrouter';
    }
    if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your-google-api-key') {
      console.log('🤖 Using Google Gemini (available API key detected)');
      return 'google';
    }

    // OpenAI disabled - uncomment below to re-enable
    /*
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key') {
      console.log('🤖 Using OpenAI (available API key detected)');
      return 'openai';
    }
    */

    // Fallback to OpenRouter if no real keys are configured
    console.log('⚠️  No valid API keys detected, using OpenRouter as fallback');
    console.log('💡 Configure OPENROUTER_API_KEY or GOOGLE_API_KEY in .env');
    console.log('💡 OpenAI support is currently disabled');
    return 'openrouter';
  }

  async synthesize(query: string, data: RetrievedData, mode?: string): Promise<SynthesisResult> {
    // Stub implementation
    const prompt = `Synthesize an answer for the query: "${query}" using the following sources:\n${data.sources.map(s => s.content).join('\n')}`;

    const response = await this.model.invoke(prompt);

    const result: SynthesisResult = {
      html: `<p>${response.content}</p>`,
      citations: data.sources.map((s, i) => ({
        id: `cite-${i + 1}`,
        title: s.title,
        url: s.url,
        snippet: s.content.substring(0, 200),
        favicon: s.favicon || '',
      })),
    };

    // For shopping mode, parse scraped data into structured items
    // In production, this would parse the retrieved data from retriever
    // which would contain scraped product information from sites like Coles, Woolworths, Aldi
    if (mode === 'shopping') {
      // Stub implementation - in real scenario, parse data.sources for product info
      result.items = [
        { name: 'Coles Full Cream Milk 1L', price: 1.19, url: 'https://coles.com.au/...' },
        { name: 'Woolworths Lite Milk 1L', price: 1.29, url: 'https://woolworths.com.au/...' },
        { name: 'Aldi Farmdale Milk 1L', price: 1.09, url: 'https://aldi.com.au/...' },
      ];
    }

    return result;
  }
}