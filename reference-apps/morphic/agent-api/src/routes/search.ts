import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Planner } from '../planner/planner';
import { Retriever } from '../retriever/retriever';
import { Synthesizer } from '../synthesizer/synthesizer';
import { UiIntentBuilder } from '../ui-intent-builder/ui-intent-builder';

const searchSchema = z.object({
  query: z.string(),
  mode: z.string().optional(),
  workspaceId: z.string().optional(),
  context: z.string().optional(),
  modelPreference: z.string().optional(),
});

export const searchRoute: FastifyPluginAsync = async (fastify) => {
  // Handle POST requests (normal API calls)
  fastify.post('/api/search', {
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
      const { query, mode, workspaceId, context, modelPreference } = request.body as z.infer<typeof searchSchema>;
      await handleSearch(query, mode || '', workspaceId || '', context || '', modelPreference || '', reply);
    },
  });

  // Handle GET requests (Google Cloud Workstations proxy)
  fastify.get('/api/search', {
    handler: async (request, reply) => {
      // Extract data from query parameters (workstation proxy converts POST to GET)
      const queryParams = request.query as any;
      const query = queryParams.query as string;
      const mode = queryParams.mode as string;
      const workspaceId = queryParams.workspaceId as string;
      const context = queryParams.context as string;
      const modelPreference = queryParams.modelPreference as string;

      console.log('🔄 Google Cloud Workstations Proxy Request:');
      console.log('📊 Query Parameters:', queryParams);
      console.log('🎯 Extracted Query:', query);

      if (!query) {
        console.log('❌ Missing query parameter in workstation proxy request');
        return reply.code(400).send({ error: 'Query parameter is required' });
      }

      await handleSearch(query, mode || '', workspaceId || '', context || '', modelPreference || '', reply);
    },
  });
};

// Shared search handler
async function handleSearch(query: string, mode: string, workspaceId: string, context: string, modelPreference: string, reply: any) {
  try {
    console.log('🔍 Processing search request:', { query, mode, modelPreference });

    // Initialize components
    const planner = new Planner();
    const retriever = new Retriever();
    const synthesizer = new Synthesizer();
    const uiIntentBuilder = new UiIntentBuilder();

    // Plan the search
    const plan = await planner.plan(query, mode || 'general', context);

    // Retrieve information
    const retrievedData = await retriever.retrieve(plan, query);

    // Synthesize answer
    const synthesizerInstance = new Synthesizer(modelPreference as any || 'openai');
    const synthesis = await synthesizerInstance.synthesize(query, retrievedData);

    // Build UI intents
    const uiIntents = uiIntentBuilder.build(synthesis, retrievedData);

    console.log('✅ Search completed successfully');
    reply.send({
      answerHtml: synthesis.html,
      citations: synthesis.citations,
      ui_intents: uiIntents,
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}