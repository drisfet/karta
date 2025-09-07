import { tavily } from '@tavily/core';
import { Plan } from '../planner/planner';

export interface RetrievedData {
  sources: Array<{
    title: string;
    url: string;
    content: string;
    favicon?: string;
  }>;
  images?: Array<{
    url: string;
    alt: string;
    aiHint?: string;
  }>;
}

export class Retriever {
  private tavilyClient: any;

  constructor() {
    this.tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || '' });
  }

  async retrieve(plan: Plan, query: string): Promise<RetrievedData> {
    // Stub implementation using Tavily
    if (plan.retrievers.includes('tavily')) {
      const searchResult = await this.tavilyClient.search(query, {
        maxResults: 5,
        includeImages: false,
      });
      return {
        sources: searchResult.results.map((r: any) => ({
          title: r.title,
          url: r.url,
          content: r.content,
        })),
      };
    }

    return { sources: [] };
  }
}