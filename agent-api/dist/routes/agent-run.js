"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentRunRoute = void 0;
const zod_1 = require("zod");
const agentRunSchema = zod_1.z.object({
    workflowId: zod_1.z.string(),
    inputs: zod_1.z.record(zod_1.z.any()).optional(),
});
const agentRunRoute = async (fastify) => {
    fastify.post('/api/agent/run', {
        schema: {
            body: agentRunSchema,
        },
        handler: async (request, reply) => {
            const { workflowId, inputs } = request.body;
            // Stub implementation
            reply.send({
                runId: `run-${Date.now()}`,
                status: 'completed',
                result: { message: 'Agent run completed' },
            });
        },
    });
};
exports.agentRunRoute = agentRunRoute;
