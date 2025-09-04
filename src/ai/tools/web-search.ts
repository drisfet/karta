'use server';
/**
 * @fileOverview A Genkit tool for performing web searches using the Tavily API.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Tavily from '@tavily/core';

const tavilyClient = new Tavily(process.env.TAVILY_API_KEY || '');

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
        })
      ),
    }),
  },
  async (input) => {
    if (!process.env.TAVILY_API_KEY) {
      console.warn('TAVILY_API_KEY is not set. Returning placeholder data.');
      return {
        results: [
          {
            title: `Placeholder: Top result for "${input.query}"`,
            url: 'https://firebase.google.com',
            content: `This is placeholder search result content because the TAVILY_API_KEY is not configured.`,
          },
        ],
      };
    }

    try {
      const searchResult = await tavilyClient.search(input.query, {
        maxResults: 5,
        includeImages: false,
      });

      // We need to map the Tavily result to our tool's output schema.
      return {
        results: searchResult.results.map((result: any) => ({
          title: result.title,
          url: result.url,
          content: result.content,
        })),
      };
    } catch (error) {
      console.error('Tavily search failed:', error);
      // Return an empty result set on error to avoid crashing the flow.
      return { results: [] };
    }
  }
);
