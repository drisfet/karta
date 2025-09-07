# Karta (AU Research Workspace)

A production-ready full-stack repository implementing a dark, immersive, draggable/resizable panel-based research workspace for Australian users.

## Features

- **Frontend**: Next.js + TypeScript + TailwindCSS + Radix UI + Framer Motion
- **Backend**: Node.js + Fastify + TypeScript
- **Database**: Supabase (Postgres with pgvector)
- **AI**: LangChain.js with swappable LLMs (Gemini, OpenRouter, OpenAI)
- **Scraping**: Playwright worker service
- **UI_INTENT System**: Backend-driven panel spawning

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd karta
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Choose your development environment:**

   ### Local Development
   ```bash
   # Start all services
   docker-compose up --build
   ```
   - Frontend: http://localhost:3000
   - Agent API: http://localhost:3001
   - Playworker: http://localhost:3002

   ### Cloud Development (IDX, Codespaces, Gitpod)
   ```bash
   # 1. Start Supabase (if using local)
   docker run -d -p 54322:5432 supabase/postgres:15.1.0.147

   # 2. Start Agent API
   cd agent-api && npm run dev

   # 3. Start Frontend (in another terminal)
   cd ../src && npm run dev
   ```

   **Cloud Environment URLs:**
   - **Google IDX**: `https://[port]-firebase-studio-[id].cloudworkstations.dev`
   - **GitHub Codespaces**: `https://[repo]-github-dev-[id].github.dev`
   - **Gitpod**: `https://[repo]-[id].gitpod.io`

4. **Access the application**
   - Frontend: Auto-detected based on environment
   - Agent API: `http://localhost:3001` (or cloud equivalent)
   - Playworker: `http://localhost:3002` (or cloud equivalent)

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- API keys for:
  - Tavily
  - OpenAI (optional)
  - Google AI (optional)
  - OpenRouter (optional)

### Environment Configuration

The application automatically detects your development environment:

- **Local Development**: Uses `http://localhost:3001` for API calls
- **Cloud Environments**: Automatically detects and uses the correct API URL
- **Custom API URL**: Override with `NEXT_PUBLIC_API_BASE_URL` environment variable

### CORS Configuration

The Agent API is configured to work with multiple development environments:

- ✅ **Localhost**: `http://localhost:3000`, `http://127.0.0.1:3000`
- ✅ **Google IDX**: `*.cloudworkstations.dev`
- ✅ **GitHub Codespaces**: `*.github.dev`
- ✅ **Gitpod**: `*.gitpod.io`
- ✅ **Development Mode**: All origins allowed when `NODE_ENV !== 'production'`

### Troubleshooting CORS Issues

If you encounter CORS errors:

1. **Check API URL**: Verify the frontend is calling the correct API endpoint
2. **Environment Variables**: Set `NEXT_PUBLIC_API_BASE_URL` if needed
3. **Restart Services**: Restart both frontend and backend after configuration changes
4. **Browser Cache**: Clear browser cache and hard refresh

### Manual Setup

1. **Install dependencies**
   ```bash
   # Frontend
   cd src && npm install

   # Agent API
   cd ../agent-api && npm install

   # Playworker
   cd ../playworker && npm install
   ```

2. **Start Supabase locally**
   ```bash
   npx supabase start
   ```

3. **Run services**
   ```bash
   # Terminal 1: Agent API
   cd agent-api && npm run dev

   # Terminal 2: Playworker
   cd playworker && npm run dev

   # Terminal 3: Frontend
   cd src && npm run dev
   ```

## Architecture

### Frontend (`src/`)
- Next.js application with panel system
- Draggable/resizable panels using Framer Motion
- UI_INTENT consumer for automatic panel spawning

### Agent API (`agent-api/`)
- Fastify server with TypeScript
- LangChain.js integration
- Model provider factory for swappable LLMs
- REST endpoints for search and agent runs

### Playworker (`playworker/`)
- Playwright-based scraping service
- Docker containerized
- Webhook integration with Agent API

### Database (`supabase/`)
- Postgres with pgvector extension
- Tables for workspaces, panels, queries, docs cache, embeddings
- Row Level Security (RLS) policies

## Supabase Integration

### Current Status: Not Required for Basic Functionality

**You can run the full LangChain-powered search experience immediately without Supabase!**

### What Supabase Provides

**User Management & Authentication:**
- User accounts and profiles
- Secure authentication flows
- Personal preferences and settings

**Data Persistence:**
- **Workspaces**: Save and restore research sessions
- **Panels**: Persistent panel layouts and configurations
- **Queries**: Search history and results caching
- **Documents**: Cached web content and metadata

**Advanced Features:**
- **Embeddings Storage**: Vector database for semantic search
- **Real-time Collaboration**: Live multi-user editing
- **API Key Management**: Secure storage of AI provider keys
- **Analytics**: Usage tracking and performance metrics

### Basic Functionality (Works Without Supabase)

✅ **Query Processing**: LangChain agents process searches
✅ **AI Responses**: Synthesis and answer generation
✅ **Interactive Panels**: ANSWER and SOURCES panels
✅ **UI_INTENT System**: Autonomous panel creation
✅ **Multi-Environment**: CORS support for cloud development
✅ **Panel Manipulation**: Drag, resize, minimize, close

### When You Need Supabase

**For Personal Use:**
- Save your research sessions and panel layouts
- Cache frequently accessed documents
- Maintain search history

**For Production/Team Use:**
- User authentication and accounts
- Multi-user collaboration features
- Secure API key storage
- Advanced analytics and monitoring

### Getting Started Without Supabase

1. **No Configuration Needed**: The app works out-of-the-box
2. **API Keys Only**: Just set your AI provider keys (OpenAI, Google, etc.)
3. **Full Experience**: All core features work immediately

### Adding Supabase Later

When you're ready to add persistence:

1. **Create Supabase Project**: `supabase init`
2. **Run Migrations**: Apply the database schema
3. **Configure Environment**: Add Supabase URL and keys
4. **Enable Features**: User auth, real-time, etc.

The application gracefully degrades without Supabase, so you can start building and testing immediately!

## API Endpoints

### Agent API
- `POST /api/search` - Perform search with query
- `POST /api/agent/run` - Run agent workflow
- `GET /api/panels/:id` - Get panel data

### Playworker
- `POST /scrape` - Scrape webpage content

## UI_INTENT Format

```json
{
  "type": "OPEN_PANEL",
  "panel": "ANSWER",
  "props": {
    "title": "Search Results",
    "html": "<p>Answer content...</p>",
    "citations": [...]
  }
}
```

## Testing

```bash
# Agent API
cd agent-api && npm test

# Frontend
cd src && npm test
```

## Deployment

The application is designed to be deployed using:
- Vercel for frontend
- Railway/Fly.io for backend services
- Supabase for database

## License

MIT
