"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const search_1 = require("./routes/search");
const agent_run_1 = require("./routes/agent-run");
const panels_1 = require("./routes/panels");
dotenv_1.default.config();
const fastify = (0, fastify_1.default)({ logger: true });
// Register plugins
fastify.register(cors_1.default, {
    origin: true, // Allow all origins for development
});
// Register routes
fastify.register(search_1.searchRoute);
fastify.register(agent_run_1.agentRunRoute);
fastify.register(panels_1.panelsRoute);
// Health check
fastify.get('/health', async () => {
    return { status: 'ok' };
});
// Start server
const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
        console.log('Agent API listening on port 3001');
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
