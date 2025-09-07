import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const panelIdSchema = z.object({
  id: z.string(),
});

export const panelsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/panels/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params as z.infer<typeof panelIdSchema>;

      // Stub implementation
      reply.send({
        id,
        type: 'ANSWER',
        props: {},
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 },
        zIndex: 1,
      });
    },
  });
};