import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { Planner } from '../planner/planner';
import { Retriever } from '../retriever/retriever';
import { Synthesizer } from '../synthesizer/synthesizer';
import { UiIntentBuilder } from '../ui-intent-builder/ui-intent-builder';

const shopSearchSchema = z.object({
  query: z.string(),
  mode: z.string().optional(),
  workspaceId: z.string().optional(),
  context: z.string().optional(),
  modelPreference: z.string().optional(),
});

export const shopSearchRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/shop/search', {
    schema: {
      body: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          mode: { type: 'string' },
          workspaceId: { type: 'string' },
          context: { type: 'string' },
          modelPreference: { type: 'string' }
        },
        required: ['query']
      }
    },
    handler: async (request, reply) => {
      const { query, mode, workspaceId, context, modelPreference } = request.body as z.infer<typeof shopSearchSchema>;
      await handleShopSearch(query, mode || '', workspaceId || '', context || '', modelPreference || '', reply);
    },
  });
};

async function handleShopSearch(query: string, mode: string, workspaceId: string, context: string, modelPreference: string, reply: any) {
  try {
    console.log('🛒 Processing shop search request:', { query, mode, modelPreference });

    // Initialize components
    const planner = new Planner();
    const retriever = new Retriever();
    const synthesizer = new Synthesizer();
    const uiIntentBuilder = new UiIntentBuilder();

    // Plan the shop search (scrape Woolworths, Coles, Aldi)
    const plan = await planner.plan(query, 'shopping', context);

    // Retrieve information (scrape sites)
    const retrievedData = await retriever.retrieve(plan, query);

    // Synthesize shop results
    const synthesizerInstance = new Synthesizer(modelPreference as any || 'openai');
    const synthesis = await synthesizerInstance.synthesize(query, retrievedData, 'shopping');

    // Build UI intents for SHOPPING panel
    const uiIntents = uiIntentBuilder.buildShop(synthesis, retrievedData);

    console.log('✅ Shop search completed successfully');
    reply.send({
      items: synthesis.items || [], // Assuming synthesis has items
      ui_intents: uiIntents,
    });
  } catch (error) {
    console.error('❌ Shop search error:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}