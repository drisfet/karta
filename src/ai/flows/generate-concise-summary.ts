'use server';

/**
 * @fileOverview A flow that generates a concise summary of search results for a Knowledge Panel.
 *
 * - generateConciseSummary - A function that generates a concise summary.
 * - GenerateConciseSummaryInput - The input type for the generateConciseSummary function.
 * - GenerateConciseSummaryOutput - The return type for the generateConciseSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { webSearch } from '../tools/web-search';

const GenerateConciseSummaryInputSchema = z.object({
  query: z.string().describe('The user query to summarize.'),
});

export type GenerateConciseSummaryInput = z.infer<typeof GenerateConciseSummaryInputSchema>;

const GenerateConciseSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the search results.'),
  images: z.array(z.object({
    url: z.string().url().describe('URL of the image.'),
    alt: z.string().describe('Alt text for the image.'),
    aiHint: z.string().describe('AI hint for the image.'),
  })).describe('A list of relevant images.'),
  sources: z.array(z.object({
    url: z.string().url().describe('URL of the source.'),
    title: z.string().describe('Title of the source.'),
    favicon: z.string().describe('URL of the source\'s favicon.'),
  })).describe('A list of sources used.'),
  steps: z.array(z.string()).describe('A list of steps related to the query.'),
});

export type GenerateConciseSummaryOutput = z.infer<typeof GenerateConciseSummaryOutputSchema>;

export async function generateConciseSummary(
  input: GenerateConciseSummaryInput
): Promise<GenerateConciseSummaryOutput> {
  return generateConciseSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConciseSummaryPrompt',
  input: {schema: GenerateConciseSummaryInputSchema},
  output: {schema: GenerateConciseSummaryOutputSchema},
  tools: [webSearch],
  prompt: `You are an AI assistant that provides a comprehensive and well-structured answer to a user's query.

  For the user query: "{{query}}", provide the following:
  
  1.  **Summary**: A concise, well-written summary that directly answers the user's question. Use the webSearch tool if you need to find real-time or specific information.
  2.  **Images**: A list of 4-6 diverse and relevant images. For each, provide a URL from picsum.photos, descriptive alt text, and a 1-2 word AI hint for a real image.
  3.  **Sources**: A list of 3-5 credible sources. If you used the webSearch tool, use the sources from the search results. For each, provide the URL, title, and a favicon URL (e.g., https://www.google.com/s2/favicons?domain=<domain>&sz=16).
  4.  **Steps**: A list of 3-4 high-level steps or key points related to the answer. If the query isn't procedural, these can be key takeaways.
  
  Prioritize providing sources based in Australia if possible.
  `,
});

const generateConciseSummaryFlow = ai.defineFlow(
  {
    name: 'generateConciseSummaryFlow',
    inputSchema: GenerateConciseSummaryInputSchema,
    outputSchema: GenerateConciseSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to produce a valid output.");
    }
    return output;
  }
);
