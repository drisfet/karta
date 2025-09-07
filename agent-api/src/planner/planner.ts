import { z } from 'zod';

const PlanSchema = z.object({
  retrievers: z.array(z.string()),
  tools: z.array(z.string()),
  context: z.string(),
});

export type Plan = z.infer<typeof PlanSchema>;

export class Planner {
  async plan(query: string, mode: string, context?: string): Promise<Plan> {
    // Stub implementation
    return {
      retrievers: ['tavily'],
      tools: mode === 'shopping' ? ['shopping'] : [],
      context: context || '',
    };
  }
}