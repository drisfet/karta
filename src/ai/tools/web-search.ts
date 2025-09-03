'use server';
/**
 * @fileOverview A Genkit tool for performing web searches. This tool is currently
 * configured to return placeholder data and does not perform live web searches.
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
        })
      ),
    }),
  },
  async (input) => {
    console.warn(
      'Web search is currently configured to return placeholder data. To enable real web search, a third-party search provider (like Tavily) and an API key are required.'
    );
    return {
      results: [
        {
          title: `Placeholder: Top result for "${input.query}"`,
          url: 'https://firebase.google.com',
          content: `This is placeholder search result content. The web search tool is not fully configured. You would typically see a summary of a webpage here.`,
        },
        {
          title: 'Placeholder: Firebase Documentation',
          url: 'https://firebase.google.com/docs',
          content: 'Explore the official Firebase documentation for guides, references, and more.',
        },
      ],
    };
  }
);
