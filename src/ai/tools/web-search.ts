'use server';
/**
 * @fileOverview A Genkit tool for performing web searches using Tavily.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Searches the web for the given query. Can be used to find real-time information, facts, and sources.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    console.warn("Web search is currently disabled. Returning placeholder data. To enable, configure a search provider.");
    return {
        results: [
            {
                title: `Web Search is Not Configured`,
                url: "https://firebase.google.com/docs/studio",
                content: `The web search tool has not been configured. Please ask the developer to set up an appropriate search provider API key in the environment variables.`
            },
             {
                title: `Example Search Result`,
                url: "https://www.google.com/search?q=" + encodeURIComponent(input.query),
                content: `This is placeholder content for the query: "${input.query}". The search tool is returning example data.`
            }
        ]
    }
  }
);
