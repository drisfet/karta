"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelsRoute = void 0;
const zod_1 = require("zod");
const panelIdSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
const panelsRoute = async (fastify) => {
    fastify.get('/api/panels/:id', {
        schema: {
            params: panelIdSchema,
        },
        handler: async (request, reply) => {
            const { id } = request.params;
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
exports.panelsRoute = panelsRoute;
