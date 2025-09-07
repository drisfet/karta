"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Synthesizer = void 0;
const model_provider_1 = require("../model-provider/model-provider");
class Synthesizer {
    model;
    constructor(modelType = 'openai') {
        this.model = model_provider_1.ModelProvider.createModel(modelType);
    }
    async synthesize(query, data) {
        // Stub implementation
        const prompt = `Synthesize an answer for the query: "${query}" using the following sources:\n${data.sources.map(s => s.content).join('\n')}`;
        const response = await this.model.invoke(prompt);
        return {
            html: `<p>${response.content}</p>`,
            citations: data.sources.map((s, i) => ({
                id: `cite-${i + 1}`,
                title: s.title,
                url: s.url,
                snippet: s.content.substring(0, 200),
                favicon: s.favicon || '',
            })),
        };
    }
}
exports.Synthesizer = Synthesizer;
