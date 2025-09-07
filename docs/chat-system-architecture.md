# Chat System Architecture Documentation

## Overview

This document describes the custom chat system implementation that provides dynamic model switching capabilities, bypassing limitations in the Vercel AI SDK's `useChat` hook.

## 🎯 Problem Solved

The original implementation using Vercel AI SDK's `useChat` hook had a critical limitation:
- `useChat` captures the `body` parameter on initialization and doesn't update when it changes
- Model switching didn't work because the API always received `model: undefined`
- Required complex workarounds like component remounting

## ✅ Solution: Custom Chat Implementation

### 1. Created Custom Chat Hook (`src/hooks/use-dynamic-chat.ts`)

```typescript
export function useDynamicChat({ api, initialMessages = [], searchContext }) {
  // ✅ Gets current model from context dynamically
  const { selectedModel } = useChatModel();

  // ✅ Always uses latest model in requests
  const sendMessage = useCallback(async (message) => {
    const requestBody = {
      messages: [...messages, userMessage],
      searchContext,
      model: selectedModel, // Always current!
    };
    // ... streaming response handling
  }, [selectedModel, ...]); // ✅ Reactive to model changes
}
```

**Key Features:**
- ✅ Dynamic model switching without remounting
- ✅ Real-time context updates
- ✅ Streaming response handling
- ✅ Request cancellation support
- ✅ Error handling and loading states

### 2. Updated ChatComponent

```typescript
// ChatComponent to handle dynamic chat with model switching
const ChatComponent = ({
  searchContext,
  initialMessages,
  onChat
}) => {
  const chat = useDynamicChat({
    api: '/api/chat',
    initialMessages,
    searchContext
  });

  // ✅ No AI SDK dependency
  // ✅ Handles model switching dynamically
  // ✅ No remounting needed
};
```

**Benefits:**
- ✅ Removed AI SDK dependency for chat functionality
- ✅ Uses `useDynamicChat` instead of `useChat`
- ✅ No more remounting needed - handles model switching dynamically
- ✅ Proper streaming response handling
- ✅ Full control over request lifecycle
- ✅ Comprehensive debug logging for troubleshooting

### 3. Context-Based Model Management (`src/hooks/use-chat-model.tsx`)

```typescript
export function ChatModelProvider({ children }) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useChatModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useChatModel must be used within a ChatModelProvider');
  }
  return context;
}
```

**Features:**
- ✅ Global model state management
- ✅ Type-safe context usage
- ✅ Proper error handling for missing provider

### 4. AI SDK Model Provider (`src/lib/ai-sdk-models.ts`)

```typescript
export class AISDKModelProvider {
  static createModel(modelId: string) {
    // Check if it's a Google Gemini model
    if (modelId.startsWith('gemini')) {
      return googleProvider(modelId);
    }

    // Check if it's an OpenRouter model
    if (modelId.includes('/') || modelId.includes('openrouter')) {
      const cleanModelId = modelId.replace('openrouter/', '');
      return openrouter.chat(cleanModelId);
    }

    // Fallback to OpenAI
    return openai.chat(modelId);
  }

  static validateModel(modelId: string): boolean
  static getProviderType(modelId: string): AIModelProvider
  static getAvailableModels()
}
```

**Capabilities:**
- ✅ Supports Google Gemini models
- ✅ Supports OpenRouter models
- ✅ Model validation
- ✅ Provider type detection

## 🎯 Key Advantages of This Solution

### Dynamic Model Switching
```javascript
// User selects model → selectedModel updates in context
// Next message automatically uses new model
// No component remounting required
// No AI SDK limitations
```

### Real-time Model Updates
- ✅ Model changes are immediately reflected in API calls
- ✅ No stale body data from captured closures
- ✅ Full control over request structure
- ✅ Reactive to context changes

### Streaming Support
- ✅ Handles Server-Sent Events properly
- ✅ Request cancellation on model switch
- ✅ Error handling and loading states
- ✅ Proper cleanup on unmount

## 🎉 Result

The model switcher now works perfectly:

- ✅ **User selects model** → Context updates immediately
- ✅ **User sends message** → API receives correct model
- ✅ **Logs show**: `"Selected model: gemini-1.5-flash"` ✅
- ✅ **No more "model: undefined"** ✅

## 📋 Architecture Summary

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  ChatModel      │───▶│  useDynamicChat  │───▶│  API Route      │
│  Context        │    │  (Custom Hook)   │    │  (/api/chat)    │
│  selectedModel  │    │                  │    │                 │
└─────────────────┘    │  ✅ Dynamic      │    │  ✅ Receives    │
                       │     model        │    │     correct     │
                       │     switching    │    │     model       │
                       └──────────────────┘    └─────────────────┘
```

## 🔧 Implementation Details

### File Structure
```
src/
├── hooks/
│   ├── use-chat-model.tsx      # Context provider for model state
│   └── use-dynamic-chat.ts     # Custom chat hook
├── lib/
│   ├── ai-sdk-models.ts        # AI SDK model provider
│   └── models.ts               # Model definitions
├── components/
│   ├── panels/types/
│   │   └── prime-panel.tsx     # Main chat component
│   └── query-bar/
│       └── chat-model-switcher.tsx # Model selector UI
└── app/api/
    └── chat/route.ts           # API endpoint
```

### Environment Variables
```bash
# Google Gemini
GOOGLE_API_KEY=your_google_api_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Model Configuration (`src/lib/models.ts`)
```typescript
export const chatModels: ModelInfo[] = [
  // Google Gemini Models
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Fast chat responses",
    provider: "Google",
    icon: Zap
  },
  // OpenRouter Models
  {
    id: "deepseek/deepseek-chat-v3.1:free",
    name: "DeepSeek Chat v3.1",
    description: "Efficient chat model",
    provider: "OpenRouter",
    icon: MessageSquare
  }
];
```

## 🚀 Usage

### Basic Usage
```typescript
import { useDynamicChat } from '@/hooks/use-dynamic-chat';
import { useChatModel } from '@/hooks/use-chat-model';

function ChatComponent() {
  const { selectedModel } = useChatModel();
  const { messages, sendMessage, isLoading, error } = useDynamicChat({
    api: '/api/chat',
    searchContext: 'optional search context'
  });

  return (
    <div>
      {/* Chat UI */}
      <button onClick={() => sendMessage({ text: 'Hello!' })}>
        Send Message
      </button>
    </div>
  );
}
```

### Model Switching
```typescript
import { useChatModel } from '@/hooks/use-chat-model';

function ModelSwitcher() {
  const { selectedModel, setSelectedModel } = useChatModel();

  return (
    <select
      value={selectedModel || ''}
      onChange={(e) => setSelectedModel(e.target.value)}
    >
      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
      <option value="deepseek/deepseek-chat-v3.1:free">DeepSeek</option>
    </select>
  );
}
```

## 🔧 API Integration

### Request Format
```json
{
  "messages": [
    {
      "role": "user",
      "parts": [{ "type": "text", "text": "Hello!" }],
      "id": "user-123"
    }
  ],
  "searchContext": "optional search context",
  "model": "gemini-1.5-flash"
}
```

### Response Format
```
data: {"role": "assistant", "parts": [{"type": "text", "text": "Hi there!"}], "id": "assistant-123"}

data: [DONE]
```

## 🐛 Troubleshooting

### Common Issues

1. **Model not updating in API calls**
   - Ensure `ChatModelProvider` wraps your app
   - Check that `useChatModel()` is called within the provider

2. **Streaming not working**
   - Verify API endpoint returns proper SSE format
   - Check network tab for connection issues

3. **Model validation errors**
   - Ensure model ID exists in `chatModels` array
   - Check `AISDKModelProvider.validateModel()` implementation

### Debug Logging
```typescript
// Enable debug logging
console.log('Selected model:', selectedModel);
console.log('Chat state:', { messages, isLoading, error });
```

## 📈 Performance Considerations

- ✅ Minimal re-renders with proper memoization
- ✅ Request cancellation prevents race conditions
- ✅ Efficient context usage
- ✅ Streaming response handling
- ✅ Proper cleanup on unmount

## 🔮 Future Enhancements

- [ ] Message persistence across sessions
- [ ] Chat history management
- [ ] File upload support
- [ ] Voice message integration
- [ ] Message reactions and threading

---

This implementation provides a robust, scalable chat system with seamless model switching capabilities, free from the limitations of third-party SDKs.