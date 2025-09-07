"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Retriever = void 0;
const core_1 = require("@tavily/core");
class Retriever {
    tavilyClient;
    constructor() {
        this.tavilyClient = (0, core_1.tavily)({ apiKey: process.env.TAVILY_API_KEY || '' });
    }
    async retrieve(plan, query) {
        // Stub implementation using Tavily
        if (plan.retrievers.includes('tavily')) {
            const searchResult = await this.tavilyClient.search(query, {
                maxResults: 5,
                includeImages: false,
            });
            return {
                sources: searchResult.results.map((r) => ({
                    title: r.title,
                    url: r.url,
                    content: r.content,
                })),
            };
        }
        return { sources: [] };
    }
}
exports.Retriever = Retriever;
