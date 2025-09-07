import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { searchRoute } from './routes/search';
import { agentRunRoute } from './routes/agent-run';
import { panelsRoute } from './routes/panels';
import { shopSearchRoute } from './routes/shop-search';

dotenv.config();

const fastify = Fastify({ logger: true });

// Environment detection and logging
const detectEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';

  console.log('🚀 Starting Agent API...');
  console.log(`📍 Environment: ${nodeEnv}`);
  console.log(`🌐 Host: ${host}`);
  console.log(`🔌 Port: ${port}`);
  console.log(`🏠 Working Directory: ${process.cwd()}`);
  console.log(`🔗 CORS: Dynamic - allows localhost + cloud dev environments (IDX, Codespaces, Gitpod)`);
  console.log(`📊 Supabase: ${process.env.SUPABASE_URL ? '✅ Configured' : '⏳ Not configured (optional)'}`);

  // Better AI models detection
  const aiModels = [];
  if (process.env.OPENAI_API_KEY) aiModels.push('OpenAI');
  if (process.env.GOOGLE_API_KEY) aiModels.push('Google');
  if (process.env.OPENROUTER_API_KEY) aiModels.push('OpenRouter');
  if (process.env.TAVILY_API_KEY) aiModels.push('Tavily');

  console.log(`🤖 AI Services: ${aiModels.length > 0 ? aiModels.join(', ') : 'None configured (add API keys to .env)'}`);

  // Show environment file location
  const envPath = '.env';
  const fs = require('fs');
  const envExists = fs.existsSync(envPath);
  console.log(`📄 Environment File: ${envExists ? '✅ Found' : '❌ Not found'} at ${envPath}`);

  console.log('─'.repeat(60));

  return { nodeEnv, port, host };
};

// Register plugins
fastify.register(cors, {
  origin: (origin, callback) => {
    // Log all origin checks for debugging
    console.log(`🔍 CORS Check: Origin="${origin || 'none'}"`);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      console.log(`🔗 CORS: ✅ Allowed (no origin)`);
      return callback(null, true);
    }

    // Allow localhost for local development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log(`🔗 CORS: ✅ Allowed localhost: ${origin}`);
      return callback(null, true);
    }

    // Allow cloud development environments
    if (origin.includes('cloudworkstations.dev') ||
        origin.includes('github.dev') ||
        origin.includes('codespaces.dev') ||
        origin.includes('gitpod.io')) {
      console.log(`🔗 CORS: ✅ Allowed cloud environment: ${origin}`);
      console.log(`   🌐 Detected: ${origin.includes('cloudworkstations.dev') ? 'Google Cloud Workstations' :
                                   origin.includes('github.dev') ? 'GitHub Codespaces' :
                                   origin.includes('gitpod.io') ? 'Gitpod' : 'Other cloud'}`);
      return callback(null, true);
    }

    // Allow all origins in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔗 CORS: ✅ Allowed dev mode: ${origin}`);
      return callback(null, true);
    }

    // In production, you might want to restrict to specific domains
    console.log(`🔗 CORS: ❌ Blocked production origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'X-Forwarded-For', 'X-Forwarded-Proto'],
  credentials: true
});

// Add headers to handle Google Cloud Workstations authentication
fastify.addHook('preHandler', (request, reply, done) => {
  // Log authentication-related headers for debugging
  if (request.headers.cookie && request.headers.cookie.includes('workstation')) {
    console.log('🔐 Workstation Auth Headers Detected');
    console.log('🍪 Cookies:', request.headers.cookie);
  }

  // Handle workstation forwarded requests
  if (request.headers['x-forwarded-for'] || request.headers['x-forwarded-proto']) {
    console.log('🌐 Forwarded Request Detected');
    console.log('📡 X-Forwarded-For:', request.headers['x-forwarded-for']);
    console.log('🔒 X-Forwarded-Proto:', request.headers['x-forwarded-proto']);
  }

  // Add headers to help with workstation proxy
  reply.header('X-Frame-Options', 'ALLOWALL');
  reply.header('Access-Control-Allow-Credentials', 'true');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, X-Forwarded-For, X-Forwarded-Proto');

  done();
});

// Register routes
fastify.register(searchRoute);
fastify.register(agentRunRoute);
fastify.register(panelsRoute);
fastify.register(shopSearchRoute);

// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'agent-api',
    port: 3001,
    cors: 'enabled',
    endpoints: ['/api/search', '/api/agent/run', '/api/panels/:id', '/api/shop/search']
  };
});

// Test endpoint for frontend connectivity
fastify.get('/test', async () => {
  return {
    message: 'Agent API is running and accessible!',
    timestamp: new Date().toISOString(),
    cors_test: 'success'
  };
});

// Start server
const start = async () => {
  try {
    const { port, host } = detectEnvironment();

    // Use the default port (3001) as primary, with fallback for cloud environments
    const defaultPort = parseInt(String(port)); // 3001 from environment or default
    let actualPort = defaultPort;

    console.log(`🎯 Attempting to bind to default port: ${defaultPort}`);

    try {
      await fastify.listen({ port: defaultPort, host });
      console.log(`✅ Successfully bound to default port ${defaultPort}`);
    } catch (err) {
      console.log(`❌ Port ${defaultPort} not available:`, (err as Error).message);
      console.log('💡 Falling back to workstation port (8080) for cloud environments...');

      // Fallback to workstation port for cloud environments
      const workstationPort = 8080;
      actualPort = workstationPort;
      await fastify.listen({ port: workstationPort, host });
      console.log(`✅ Successfully bound to workstation port ${workstationPort}`);
    }

    console.log('✅ Agent API started successfully!');
    console.log(`🌍 Server URL: http://${host === '0.0.0.0' ? 'localhost' : host}:${actualPort}`);
    console.log(`🔍 Health Check: http://localhost:${actualPort}/health`);
    console.log(`🧪 Test Endpoint: http://localhost:${actualPort}/test`);
    console.log(`📋 API Endpoints:`);
    console.log(`   POST /api/search - Main search endpoint`);
    console.log(`   POST /api/agent/run - Agent workflow execution`);
    console.log(`   GET /api/panels/:id - Panel data retrieval`);
    console.log(`   POST /api/shop/search - Shopping search endpoint`);
    console.log('─'.repeat(60));
    console.log('🔧 Port Configuration:');
    console.log(`   • Primary Port: 3001 (default)`);
    console.log(`   • Fallback Port: 8080 (cloud environments)`);
    console.log(`   • Active Port: ${actualPort}`);
    console.log('─'.repeat(60));
    console.log('☁️  Cloud Environment Support:');
    if (actualPort === 8080) {
      console.log(`   • Running on workstation port for cloud compatibility`);
      console.log(`   • Expected Frontend Access: https://8080-[instance].cloudworkstations.dev`);
    } else {
      console.log(`   • Running on standard port for local development`);
      console.log(`   • Frontend should connect via: http://localhost:3001`);
    }
    console.log('   • CORS: Configured for cross-origin access');
    console.log('   • Authentication: Supports workstation auth headers');
    console.log('   • Headers: Configured to handle forwarded requests');
    console.log('─'.repeat(60));
    console.log('🎉 Agent API is ready to accept requests!');
  } catch (err) {
    console.error('❌ Failed to start Agent API:', err);
    fastify.log.error(err);
    process.exit(1);
  }
};

start();