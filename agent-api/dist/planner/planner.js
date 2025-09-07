"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planner = void 0;
const zod_1 = require("zod");
const PlanSchema = zod_1.z.object({
    retrievers: zod_1.z.array(zod_1.z.string()),
    tools: zod_1.z.array(zod_1.z.string()),
    context: zod_1.z.string(),
});
class Planner {
    async plan(query, mode, context) {
        // Stub implementation
        return {
            retrievers: ['tavily'],
            tools: mode === 'shopping' ? ['shopping'] : [],
            context: context || '',
        };
    }
}
exports.Planner = Planner;
