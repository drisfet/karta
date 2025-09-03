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

const GenerateConciseSummaryInputSchema = z.object({
  searchResults: z
    .string()
    .describe('The search results to summarize.'),
});

export type GenerateConciseSummaryInput = z.infer<
  typeof GenerateConciseSummaryInputSchema
>;

const GenerateConciseSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the search results.'),
});

export type GenerateConciseSummaryOutput = z.infer<
  typeof GenerateConciseSummaryOutputSchema
>;

export async function generateConciseSummary(
  input: GenerateConciseSummaryInput
): Promise<GenerateConciseSummaryOutput> {
  return generateConciseSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConciseSummaryPrompt',
  input: {schema: GenerateConciseSummaryInputSchema},
  output: {schema: GenerateConciseSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes search results into a concise summary.

  Summarize the following search results:
  {{searchResults}}`,
});

const generateConciseSummaryFlow = ai.defineFlow(
  {
    name: 'generateConciseSummaryFlow',
    inputSchema: GenerateConciseSummaryInputSchema,
    outputSchema: GenerateConciseSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
