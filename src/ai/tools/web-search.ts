'use server';
/**
 * @fileOverview A Genkit tool for performing web searches using Tavily.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description:
      'Searches the web for the given query. Can be used to find real-time information, facts, and sources.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          content: z.string(),
          score: z.number(),
          raw_content: z.string().optional(),
        })
      ),
    }),
  },
  async (input) => {
    console.warn(
      'Web search is currently mocked. Returning placeholder data. Please set TAVILY_API_KEY in your .env file and install the required package.'
    );
    return {
      results: [
        {
          title: `Placeholder Results for "${input.query}"`,
          url: 'https://www.google.com/search?q=tavily+api',
          content: `This is placeholder data because the web search tool is not fully configured. To enable real web search, you need a service like Tavily and its API key.`,
          score: 0,
        },
      ],
    };
  }
);
