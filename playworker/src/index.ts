import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { scrapeRoute } from './routes/scrape';

dotenv.config();

const fastify = Fastify({ logger: true });

// Environment detection and logging
const detectEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || 3002;
  const host = process.env.HOST || '0.0.0.0';

  console.log('🚀 Starting Playworker...');
  console.log(`📍 Environment: ${nodeEnv}`);
  console.log(`🌐 Host: ${host}`);
  console.log(`🔌 Port: ${port}`);
  console.log(`🏠 Working Directory: ${process.cwd()}`);
  console.log(`📊 Playwright: Available for web scraping`);
  console.log(`🔗 CORS: Dynamic - allows localhost + cloud dev environments (IDX, Codespaces, Gitpod)`);

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
fastify.register(scrapeRoute);

// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'playworker',
    port: 3002,
    cors: 'enabled',
    endpoints: ['POST /scrape']
  };
});

// Test endpoint for frontend connectivity
fastify.get('/test', async () => {
  return {
    message: 'Playworker is running and accessible!',
    timestamp: new Date().toISOString(),
    cors_test: 'success'
  };
});

// Start server
const start = async () => {
  try {
    const { port, host } = detectEnvironment();

    // For Google Cloud Workstations, use a consistent port (3002 for playworker)
    const workstationPort = 3002;
    let actualPort = workstationPort;

    console.log(`🎯 Attempting to bind to workstation port: ${workstationPort}`);

    try {
      await fastify.listen({ port: workstationPort, host });
      console.log(`✅ Successfully bound to workstation port ${workstationPort}`);
    } catch (err) {
      console.log(`❌ Port ${workstationPort} not available:`, (err as Error).message);
      console.log('💡 Falling back to default port detection...');

      // Fallback to original port detection
      actualPort = parseInt(String(port));
      await fastify.listen({ port: actualPort, host });
      console.log(`✅ Successfully bound to fallback port ${actualPort}`);
    }

    console.log('✅ Playworker started successfully!');
    console.log(`🌍 Server URL: http://${host === '0.0.0.0' ? 'localhost' : host}:${actualPort}`);
    console.log(`🔍 Health Check: http://localhost:${actualPort}/health`);
    console.log(`🧪 Test Endpoint: http://localhost:${actualPort}/test`);
    console.log(`📋 API Endpoints:`);
    console.log(`   POST /scrape - Web scraping endpoint`);
    console.log('─'.repeat(60));
    console.log('☁️  Google Cloud Workstations Configuration:');
    console.log(`   • Backend Port: ${actualPort} (dynamically selected)`);
    console.log(`   • Expected Frontend Access: https://${actualPort}-[instance].cloudworkstations.dev`);
    console.log(`   • CORS: Configured for cloud domain access`);
    console.log(`   • Playwright: Ready for web scraping`);
    console.log('   • Authentication: Workstation may redirect through auth');
    console.log('   • Headers: Configured to handle forwarded requests');
    console.log('   • Cookies: Support for workstation authentication');
    console.log('─'.repeat(60));
    console.log('🎯 If authentication issues persist:');
    console.log('   1. Check workstation configuration');
    console.log('   2. Verify port exposure settings');
    console.log('   3. Consider using workstation service discovery');
    console.log('─'.repeat(60));
    console.log('🎉 Ready to accept scraping requests from cloud frontend!');
  } catch (err) {
    console.error('❌ Failed to start Playworker:', err);
    fastify.log.error(err);
    process.exit(1);
  }
};

start();