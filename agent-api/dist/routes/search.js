"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoute = void 0;
const zod_1 = require("zod");
const planner_1 = require("../planner/planner");
const retriever_1 = require("../retriever/retriever");
const synthesizer_1 = require("../synthesizer/synthesizer");
const ui_intent_builder_1 = require("../ui-intent-builder/ui-intent-builder");
const searchSchema = zod_1.z.object({
    query: zod_1.z.string(),
    mode: zod_1.z.string().optional(),
    workspaceId: zod_1.z.string().optional(),
    context: zod_1.z.string().optional(),
    modelPreference: zod_1.z.string().optional(),
});
const searchRoute = async (fastify) => {
    fastify.post('/api/search', {
        schema: {
            body: searchSchema,
        },
        handler: async (request, reply) => {
            const { query, mode, workspaceId, context, modelPreference } = request.body;
            try {
                // Initialize components
                const planner = new planner_1.Planner();
                const retriever = new retriever_1.Retriever();
                const synthesizer = new synthesizer_1.Synthesizer();
                const uiIntentBuilder = new ui_intent_builder_1.UiIntentBuilder();
                // Plan the search
                const plan = await planner.plan(query, mode || 'general', context);
                // Retrieve information
                const retrievedData = await retriever.retrieve(plan, query);
                // Synthesize answer
                const synthesizerInstance = new synthesizer_1.Synthesizer(modelPreference || 'openai');
                const synthesis = await synthesizerInstance.synthesize(query, retrievedData);
                // Build UI intents
                const uiIntents = uiIntentBuilder.build(synthesis, retrievedData);
                reply.send({
                    answerHtml: synthesis.html,
                    citations: synthesis.citations,
                    ui_intents: uiIntents,
                });
            }
            catch (error) {
                fastify.log.error(error);
                reply.code(500).send({ error: 'Internal server error' });
            }
        },
    });
};
exports.searchRoute = searchRoute;
