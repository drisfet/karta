import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const agentRunSchema = z.object({
  workflowId: z.string(),
  inputs: z.record(z.any()).optional(),
});

export const agentRunRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/agent/run', {
    schema: {
      body: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
          inputs: { type: 'object' }
        },
        required: ['workflowId']
      }
    },
    handler: async (request, reply) => {
      const { workflowId, inputs } = request.body as z.infer<typeof agentRunSchema>;

      // Stub implementation
      reply.send({
        runId: `run-${Date.now()}`,
        status: 'completed',
        result: { message: 'Agent run completed' },
      });
    },
  });
};