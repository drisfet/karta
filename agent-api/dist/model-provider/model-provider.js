"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProvider = void 0;
const openai_1 = require("@langchain/openai");
const google_genai_1 = require("@langchain/google-genai");
class ModelProvider {
    static createModel(type, modelName) {
        switch (type) {
            case 'openai':
                return new openai_1.ChatOpenAI({
                    modelName: modelName || 'gpt-3.5-turbo',
                    openAIApiKey: process.env.OPENAI_API_KEY,
                });
            case 'google':
                return new google_genai_1.ChatGoogleGenerativeAI({
                    modelName: modelName || 'gemini-1.5-flash',
                    apiKey: process.env.GOOGLE_API_KEY,
                });
            case 'openrouter':
                return new openai_1.ChatOpenAI({
                    modelName: modelName || 'openai/gpt-3.5-turbo',
                    openAIApiKey: process.env.OPENROUTER_API_KEY,
                    configuration: {
                        baseURL: 'https://openrouter.ai/api/v1',
                    },
                });
            default:
                throw new Error(`Unsupported model type: ${type}`);
        }
    }
}
exports.ModelProvider = ModelProvider;
