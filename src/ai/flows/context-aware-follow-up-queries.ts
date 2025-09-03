'use server';
/**
 * @fileOverview An AI agent that handles follow-up queries within the context of a Knowledge Panel.
 *
 * - contextAwareFollowUpQueries - A function that processes follow-up questions within the context of a Knowledge Panel.
 * - ContextAwareFollowUpQueriesInput - The input type for the contextAwareFollowUpQueries function.
 * - ContextAwareFollowUpQueriesOutput - The return type for the contextAwareFollowUpQueries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextAwareFollowUpQueriesInputSchema = z.object({
  originalQuery: z.string().describe('The original query that initiated the Knowledge Panel.'),
  followUpQuery: z.string().describe('The user\u2019s follow-up question.'),
  knowledgePanelContent: z.string().describe('The content of the current Knowledge Panel.'),
});
export type ContextAwareFollowUpQueriesInput = z.infer<typeof ContextAwareFollowUpQueriesInputSchema>;

const ContextAwareFollowUpQueriesOutputSchema = z.object({
  answer: z.string().describe('The AI\u2019s answer to the follow-up question, considering the context.'),
});
export type ContextAwareFollowUpQueriesOutput = z.infer<typeof ContextAwareFollowUpQueriesOutputSchema>;

export async function contextAwareFollowUpQueries(input: ContextAwareFollowUpQueriesInput): Promise<ContextAwareFollowUpQueriesOutput> {
  return contextAwareFollowUpQueriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextAwareFollowUpQueriesPrompt',
  input: {schema: ContextAwareFollowUpQueriesInputSchema},
  output: {schema: ContextAwareFollowUpQueriesOutputSchema},
  prompt: `You are an AI assistant helping a user explore a topic within a \"Knowledge Panel.\"

The user has already asked an initial question: {{{originalQuery}}}

The Knowledge Panel currently contains the following information:
{{{knowledgePanelContent}}}

The user is now asking a follow-up question:
{{{followUpQuery}}}

Based on the original question, the content of the Knowledge Panel, and the follow-up question, provide a concise and relevant answer. Prioritize providing sources based in Australia if possible.
`,
});

const contextAwareFollowUpQueriesFlow = ai.defineFlow(
  {
    name: 'contextAwareFollowUpQueriesFlow',
    inputSchema: ContextAwareFollowUpQueriesInputSchema,
    outputSchema: ContextAwareFollowUpQueriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
