# Morphic Template - Karta Enhancement

This document describes the advanced AI agent capabilities that have been integrated into the Morphic template, drawing from the LangChain Next.js template and the Karta project's backend structure.

## Overview

The Morphic template has been enhanced with a sophisticated backend agent API system that provides:

- **AI Agent Orchestration**: Using LangChain.js for planning, retrieval, synthesis, and UI intent building
- **Multi-Model Support**: Support for OpenAI, Google Gemini, and OpenRouter models
- **Panel-Based UI**: Backend-driven UI panel spawning with drag/resize functionality
- **Web Scraping**: Playwright-based scraping worker for data collection
- **Database Integration**: Supabase with pgvector for embeddings
- **Cloud-Aware Deployment**: Dynamic ports and CORS for cloud environments

## Architecture

### Backend Structure

The new backend is located in `agent-api/` and mirrors the Karta project's structure:

```
agent-api/
├── src/
│   ├── index.ts                 # Main Fastify server with CORS and cloud support
│   ├── model-provider/          # Multi-model abstraction layer
│   ├── planner/                 # Query planning and tool selection
│   ├── retriever/               # Information retrieval (Tavily integration)
│   ├── synthesizer/             # Answer synthesis and formatting
│   ├── ui-intent-builder/       # UI panel generation
│   └── routes/                  # API endpoints
│       ├── search.ts           # Main search endpoint
│       ├── agent-run.ts        # Agent workflow execution
│       ├── panels.ts           # Panel data retrieval
│       └── shop-search.ts      # Shopping search endpoint
├── package.json
└── tsconfig.json
```

### Key Components

#### Model Provider (`model-provider/model-provider.ts`)
- Abstracts multiple LLM providers (OpenAI, Google, OpenRouter)
- Auto-detects available API keys
- Handles model switching and configuration

#### Planner (`planner/planner.ts`)
- Plans search strategies based on query type
- Selects appropriate retrievers and tools
- Supports general search and shopping modes

#### Retriever (`retriever/retriever.ts`)
- Integrates with Tavily for web search
- Handles data collection and preprocessing
- Supports multiple retrieval strategies

#### Synthesizer (`synthesizer/synthesizer.ts`)
- Synthesizes retrieved data into coherent answers
- Generates structured output for different modes
- Handles citations and source attribution

#### UI Intent Builder (`ui-intent-builder/ui-intent-builder.ts`)
- Generates UI panel configurations
- Supports answer, sources, and shopping panels
- Integrates with frontend panel system

## API Endpoints

### Search Endpoint
```
POST /api/search
```
- Main search functionality with AI agent capabilities
- Supports query, mode, context, and model preferences
- Returns synthesized answers with citations and UI intents

### Agent Run Endpoint
```
POST /api/agent/run
```
- Executes agent workflows
- Accepts workflow ID and input parameters
- Returns execution results

### Panels Endpoint
```
GET /api/panels/:id
```
- Retrieves panel data by ID
- Returns panel configuration and content

### Shop Search Endpoint
```
POST /api/shop/search
```
- Specialized shopping search functionality
- Scrapes product data from multiple sources
- Returns structured shopping results

## New Page: Karta Enhanced Version

A new page has been created at `app/karta/page.tsx` that exactly replicates the main Morphic page (`app/page.tsx`). This serves as a working copy for extending and enhancing with AI agent capabilities while keeping the original page untouched as a reference.

### Features of the Enhanced Page
- **Exact Replica**: Same functionality as the original page
- **Extensible**: Ready for AI agent integration
- **Documented**: Includes comments indicating customization points
- **Reference**: Original page remains available for comparison

## Best Practices Applied from LangChain Template

### Agent Implementation
- **Tool Calling**: Proper agent tool integration with LangChain
- **Streaming**: Real-time response streaming
- **Error Handling**: Comprehensive error handling and validation
- **Configuration**: Environment-based configuration management

### Retrieval Systems
- **Vector Stores**: Supabase integration with pgvector
- **Document Processing**: Text splitting and embedding generation
- **Search Optimization**: Efficient retrieval with metadata filtering

### Tool Integration
- **Tavily Search**: Web search integration for real-time data
- **Custom Tools**: Framework for adding custom agent tools
- **Tool Validation**: Input validation and error handling

### Streaming and Chat
- **Real-time Responses**: Streaming text responses
- **Intermediate Steps**: Optional display of agent reasoning
- **Conversation Management**: Chat history and context handling

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the Morphic root directory:

```bash
# AI Model Providers (choose at least one)
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Search and Data Services
TAVILY_API_KEY=your-tavily-api-key

# Supabase (for vector storage)
SUPABASE_URL=your-supabase-url
SUPABASE_PRIVATE_KEY=your-supabase-private-key

# Backend Configuration
PORT=3001
NODE_ENV=development
```

### Running the Enhanced Template

#### Frontend Only (Original Functionality)
```bash
npm run dev
```

#### Backend Agent API Only
```bash
npm run agent-api:dev
```

#### Frontend + Backend Together
```bash
npm run dev:all
```

## Integration Points

### Connecting Frontend to Backend

The enhanced page (`app/karta/page.tsx`) can be modified to connect to the backend agent API:

```typescript
// Example integration in a chat component
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userQuery,
    mode: 'general',
    modelPreference: 'openrouter'
  })
});

const result = await response.json();
// Handle synthesized answer, citations, and UI intents
```

### Panel System Integration

The backend returns UI intents that can spawn panels in the frontend:

```typescript
// Example panel spawning
uiIntents.forEach(intent => {
  if (intent.type === 'OPEN_PANEL') {
    spawnPanel(intent.panel, intent.props);
  }
});
```

## Cloud Deployment

The backend is configured for cloud environments:

- **Google Cloud Workstations**: Automatic port detection (8080 fallback)
- **GitHub Codespaces**: CORS and proxy support
- **Gitpod**: Environment detection and configuration
- **Dynamic Ports**: Automatic port selection for cloud compatibility

## Model Configuration Guide

### Using OpenRouter as Default Provider

The Morphic template has been configured to use OpenRouter as the primary provider instead of requiring OpenAI. Here's how it works:

#### 🚨 **Important: Clear Browser Cookies**
If you're still getting "selected provider is not enabled" errors, you need to clear your browser cookies for the site. The model selector saves your selected model in cookies, and if you previously selected an OpenAI model, it will try to use that even after the configuration changes.

**To fix this:**
1. Open browser DevTools (F12)
2. Go to Application/Storage > Cookies
3. Delete the `selectedModel` cookie
4. Refresh the page

**Also restart your development server:**
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

#### Cloud Environment Fix
If you're seeing "fetch failed" errors in cloud environments (like Google Cloud Workstations), the system has been updated to handle this automatically by falling back to properly configured default models that use OpenRouter instead of OpenAI.

#### Authentication Temporarily Disabled
For development purposes, authentication has been temporarily disabled in the chat API. The system now uses an anonymous user by default.

#### Environment Variables Fixed
**Important:** If you see "No auth credentials found" errors, make sure your API keys in `.env.local` are not wrapped in brackets `[]`. The brackets are placeholders and must be removed for the keys to work.

**Before (❌ won't work):**
```bash
OPENAI_COMPATIBLE_API_KEY=[sk-or-v1-...]
```

**After (✅ will work):**
```bash
OPENAI_COMPATIBLE_API_KEY=sk-or-v1-...
```

**To re-enable authentication later:**
1. Uncomment the import: `// import { getCurrentUserId } from '@/lib/auth/get-current-user'`
2. Uncomment the authentication call: `// const userId = await getCurrentUserId()`
3. Comment out the temporary line: `// const userId = 'anonymous'`
4. Configure Supabase environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

#### 1. Environment Setup
```bash
# Primary: OpenRouter (OpenAI-compatible)
OPENAI_COMPATIBLE_API_KEY=your-openrouter-api-key
OPENAI_COMPATIBLE_API_BASE_URL=https://openrouter.ai/api/v1

# Optional: Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key

# Search
TAVILY_API_KEY=your-tavily-api-key
```

#### 2. Model Configuration
Models are configured in `public/config/models.json`. The template loads models from this file, which overrides the defaults.

**Current Configuration:**
- **GLM-4.5 Air (Free)** - Default model from OpenRouter
- **DeepSeek V3.1 (Free)** - Alternative free model
- **WizardLM-2 8x22B** - High-performance model
- **Claude 3.5 Sonnet** - Premium model via OpenRouter
- **GPT-4o Mini** - OpenAI model via OpenRouter
- **Gemini 2.0 Flash** - Google model

#### 3. How to Add/Configure Models

**To add a new OpenRouter model:**
1. Find the model ID on [OpenRouter](https://openrouter.ai/models)
2. Add it to `public/config/models.json`:
```json
{
  "id": "anthropic/claude-3-haiku",
  "name": "Claude 3 Haiku",
  "provider": "OpenRouter",
  "providerId": "openai-compatible",
  "enabled": true,
  "toolCallType": "native"
}
```

**To enable/disable models:**
- Set `"enabled": true` to show the model in the selector
- Set `"enabled": false` to hide it

**To add other providers:**
1. Uncomment the provider in `.env.local`
2. Add the API key
3. Add models to `models.json` with the correct `providerId`

#### 4. Provider IDs and Their Environment Variables

| Provider | providerId | Environment Variable |
|----------|------------|---------------------|
| OpenRouter | `openai-compatible` | `OPENAI_COMPATIBLE_API_KEY` |
| Google | `google` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` |
| OpenAI | `openai` | `OPENAI_API_KEY` |
| Groq | `groq` | `GROQ_API_KEY` |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` |

#### 5. Model Selection in UI

Once configured, models appear in the chat interface's model selector. The first enabled model becomes the default.

## Development Workflow

1. **Configure Environment**: Update `.env.local` with your API keys
2. **Customize Models**: Edit `public/config/models.json` to add/remove models
3. **Start Development**: Use `npm run dev` for frontend only
4. **Test Backend**: Use `npm run agent-api:dev` for backend only
5. **Full Stack**: Use `npm run dev:all` for both frontend and backend
6. **Access Enhanced Page**: Navigate to `/karta` for the panel system
7. **Compare**: Use original `/` page as reference

## Initial Query Auto-Processing

When you create a panel with a query (like typing in the main input field), the system now automatically:

1. **Creates the panel** with your query as the title
2. **Sends your query** as the first message to the AI
3. **Starts processing** immediately - no need to re-enter the query
4. **Shows the response** in real-time as the AI processes

### How It Works

```tsx
// When you type "What is React?" in the main input:
window.panelAPI.createPanel('PRIME', 'What is React?', {
  query: 'What is React?',  // This becomes the first message
  models: loadedModels
});

// The panel automatically:
// 1. Adds the query as the initial user message
// 2. Immediately submits it to the AI for processing
// 3. Starts streaming the response in real-time
```

### Benefits

- ✅ **No duplicate work** - Your query is processed once
- ✅ **Immediate feedback** - Response starts right away
- ✅ **Better UX** - Seamless panel creation and processing
- ✅ **Persistent conversations** - Chat history maintained
- ✅ **Auto-processing** - Initial query submitted automatically after 1-second delay
- ✅ **Real-time streaming** - Response appears immediately
- ✅ **Same mechanism as manual save** - Uses `handleUpdateAndReloadMessage` (same as edit/save)

## 🔧 **Auto-Submit Implementation Details**

### **How It Works**
The auto-submit feature uses the **exact same mechanism** as the manual edit/save process:

1. **Trigger**: `useEffect` detects initial messages in ready state
2. **Function**: Calls `handleUpdateAndReloadMessage()` (same as edit/save)
3. **Processing**: Uses `reload()` to resubmit message to AI
4. **Response**: AI processes and streams response normally

### **Key Implementation Points**
- **Location**: `components/panel-chat/panel-chat.tsx` lines 74-103
- **Function Used**: `handleUpdateAndReloadMessage` (same as manual save)
- **Delay**: 1 second (configurable)
- **Guards**: Prevents duplicate submissions, checks loading state
- **Error Handling**: Graceful fallback on failures

### **Future Improvements**
- Make delay configurable via props
- Add visual feedback during delay
- Support different auto-submit strategies
- Add user preference to enable/disable

## Modular Chat Components

The chat functionality has been modularized into reusable components that can be used in any panel:

### Available Components

#### `PanelChat` - Main Chat Component
```tsx
import { PanelChat } from '@/components/panel-chat';

<PanelChat
  chatId="unique-chat-id"
  models={models}
  placeholder="Ask me anything..."
  compactMode={false}
  onMessageSent={(message) => console.log('Message sent:', message)}
/>
```

#### `PanelChatMessages` - Message Display
```tsx
import { PanelChatMessages } from '@/components/panel-chat';

<PanelChatMessages
  sections={chatSections}
  data={toolData}
  onQuerySelect={(query) => handleQuery(query)}
  isLoading={isLoading}
  chatId="chat-id"
  scrollContainerRef={scrollRef}
/>
```

#### `PanelChatInput` - Input Component
```tsx
import { PanelChatInput } from '@/components/panel-chat';

<PanelChatInput
  input={inputValue}
  handleInputChange={handleChange}
  handleSubmit={handleSubmit}
  isLoading={isLoading}
  placeholder="Type your message..."
  models={models}
  compactMode={false}
/>
```

### Panel Types

#### `CHAT_PANEL` - Dedicated Chat Panel
```tsx
// Create a chat panel
const chatPanelConfig = PanelRegistry.createPanelConfig(
  'CHAT_PANEL',
  'AI Assistant',
  {
    title: 'AI Assistant',
    placeholder: 'How can I help you?',
    compactMode: false,
    showModelSelector: true,
    showSearchToggle: true
  }
);
```

### Usage Examples

#### Basic Chat Panel
```tsx
import { PanelChat } from '@/components/panel-chat';

function MyPanel() {
  return (
    <div className="panel-content">
      <PanelChat
        chatId={generateId()}
        placeholder="Ask me anything..."
        compactMode={false}
      />
    </div>
  );
}
```

#### Compact Chat for Sidebars
```tsx
<PanelChat
  chatId={generateId()}
  placeholder="Quick question..."
  compactMode={true}
  className="h-96"
/>
```

#### Custom Chat with Callbacks
```tsx
<PanelChat
  chatId={generateId()}
  onMessageSent={(message) => {
    // Handle message sent
    console.log('User sent:', message);
    // Update parent state, send analytics, etc.
  }}
  placeholder="What would you like to know?"
/>
```

## Next Steps

The enhanced Morphic template is now ready for:

- **AI Agent Integration**: Connect chat to backend search API
- **Panel System**: Implement drag/resize panels for results
- **Advanced Features**: Add retrieval-augmented generation
- **Custom Tools**: Extend agent capabilities with domain-specific tools
- **Multi-Modal**: Support for images and structured data

## Testing Modular Components

### Quick Test
To test the new modular chat components:

1. **Open the Karta page**: Navigate to `/karta`
2. **Trigger a panel**: Use the query bar to create a panel
3. **Wait 1 second**: Auto-submit triggers automatically
4. **Watch the response**: AI starts processing immediately
5. **Test additional messages**: Send follow-up messages in the panel
6. **Verify persistence**: Input should stay at bottom, messages should scroll properly

### Creating a Test Panel
```tsx
// In any component, you can create a chat panel like this:
import { PanelRegistry } from '@/components/panels/panel-registry';

const testPanel = PanelRegistry.createPanelConfig(
  'CHAT_PANEL',
  'Test Chat',
  {
    title: 'Test Chat Panel',
    placeholder: 'Test the modular chat...',
    compactMode: false
  }
);

// Add to your panel manager
panelManager.addPanel(testPanel);
```

## Troubleshooting

### Common Issues

1. **Backend Not Starting**: Check environment variables and port availability
2. **CORS Errors**: Ensure backend is running and CORS is configured
3. **Model API Errors**: Verify API keys and model availability
4. **Panel Not Loading**: Check UI intent format and panel component integration
5. **Chat Not Working**: Ensure OpenRouter API key is properly configured
6. **Input Not Persisting**: Check that `PanelChatInput` is at the bottom of the panel
7. **Chat Resetting on Panel Interaction**: Fixed - chat state now persists across panel interactions using stable chat IDs
8. **Tool Choice Error**: Fixed - GLM model configuration updated to use manual tool calling instead of native
9. **Related Questions Error**: Added error handling to gracefully fallback when model doesn't support tool calling
10. **RelatedQuestions.items Undefined**: Fixed - Added null checks and corrected data structure to match schema expectations
11. **Initial Query Auto-Processing**: Added - Panels now automatically process the initial query as the first message when created

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=agent-api:*
```

## Support

For issues or questions about the enhanced Morphic template:

1. Check the original Karta project documentation
2. Review LangChain template examples
3. Test with the provided environment variables
4. Verify backend health at `/health` endpoint

---

This enhancement transforms the Morphic template into a powerful AI research platform while maintaining its original simplicity and extensibility.