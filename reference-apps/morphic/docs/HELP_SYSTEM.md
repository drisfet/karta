# Help System Documentation

## Overview

The Morphic Help System is a robust, modular, and scalable help feature that provides context-aware assistance throughout the application. It leverages the existing chat infrastructure while maintaining clean separation of concerns and following best practices for extensibility.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Content Management](#content-management)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Extending the System](#extending-the-system)
- [Migration Guide](#migration-guide)

## Features

### Core Features
- **Context-Aware Help**: Provides relevant help based on the current section/context
- **Modular Components**: Reusable components that can be imported anywhere
- **Markdown Support**: Help content written in easy-to-maintain Markdown files
- **Intelligent Search**: Relevance-based search across help documents
- **Streaming Responses**: Real-time help responses using existing chat infrastructure
- **Caching System**: Efficient document loading and storage
- **Error Handling**: Graceful fallbacks and user feedback
- **TypeScript Support**: Full type safety throughout the system

### Integration Features
- **Existing Chat System**: Leverages the established PanelChat infrastructure
- **React Context**: Clean state management with React hooks
- **Server-Side Processing**: File system operations handled securely on the server
- **API-First Design**: RESTful API for all help operations

## Architecture

### System Components

```
Help System Architecture
├── 📁 docs/help/                    # Help content (Markdown files)
│   ├── 📁 studio/                   # Studio-specific help
│   ├── 📁 main-app/                 # Main app help
│   └── 📁 [category]/               # Custom categories
├── 🔧 lib/help/                     # Core help system logic
│   ├── help-provider.tsx           # React context provider
│   ├── test-help.ts                # Testing utilities
│   └── (help-system.ts)            # Server-side processing
├── 🖥️ components/help/              # React components
│   ├── help-chat.tsx               # Main help chat component
│   └── index.ts                    # Component exports
├── 🌐 app/api/help/                 # Server API endpoints
│   └── route.ts                     # Help API routes
└── 🎯 Integration Points            # Where help is used
    ├── app/studio/page.tsx         # Studio integration
    └── [other-pages]               # Future integrations
```

### Data Flow

```
User Query → HelpChat Component → HelpProvider → API Route → Help System → Markdown Files
                                      ↓
Response ← Streaming Chat ← AI Context ← Formatted Help ← Search Results
```

## Quick Start

### 1. Basic Integration

```tsx
import { HelpProvider } from '@/lib/help/help-provider'
import { StudioHelpChat } from '@/components/help'

export default function MyPage() {
  return (
    <HelpProvider>
      <div>
        {/* Your page content */}
        <StudioHelpChat chatId="my-help-chat" />
      </div>
    </HelpProvider>
  )
}
```

### 2. Add Help Content

Create a Markdown file in the appropriate category:

```markdown
# My Feature Help

This is help content for my feature.

## Getting Started

1. First step
2. Second step
3. Third step
```

### 3. Test the System

```javascript
// In browser console
runAllTests() // Run comprehensive tests
```

## Installation

The help system is already integrated into the Morphic project. No additional installation is required.

### Dependencies

The system uses existing project dependencies:
- React (for components)
- Next.js (for API routes)
- TypeScript (for type safety)
- Existing chat infrastructure

### File Structure

Ensure the following files are in place:

```
reference-apps/morphic/
├── app/api/help/route.ts
├── lib/help/
│   ├── help-provider.tsx
│   └── test-help.ts
├── components/help/
│   ├── help-chat.tsx
│   └── index.ts
└── docs/help/
    ├── studio/
    └── main-app/
```

## Usage

### Basic Usage

#### 1. Wrap Your App/Component

```tsx
import { HelpProvider } from '@/lib/help/help-provider'

export default function App() {
  return (
    <HelpProvider>
      {/* Your app content */}
    </HelpProvider>
  )
}
```

#### 2. Add Help Components

```tsx
import { StudioHelpChat, MainAppHelpChat, HelpChat } from '@/components/help'

// Specialized components
<StudioHelpChat chatId="studio-help" />
<MainAppHelpChat chatId="main-help" />

// Generic component with custom category
<HelpChat
  chatId="custom-help"
  category="my-feature"
  placeholder="Ask about my feature..."
  initialQuery="How do I use this feature?"
/>
```

### Advanced Usage

#### Custom Configuration

```tsx
<HelpProvider basePath="custom/help/path" autoInitialize={true}>
  <HelpChat
    chatId="advanced-help"
    category="advanced"
    compactMode={true}
    className="my-custom-help"
  />
</HelpProvider>
```

#### Using Help Hooks

```tsx
import { useHelp, useHelpChat } from '@/lib/help/help-provider'

function MyComponent() {
  const { searchHelp, getCategories, isInitialized } = useHelp()
  const { getHelpContext } = useHelpChat()

  const handleSearch = async () => {
    const results = await searchHelp('workflow', 'studio')
    console.log('Search results:', results)
  }

  const handleGetContext = async () => {
    const context = await getHelpContext('How do I create a node?')
    console.log('Help context:', context)
  }

  return (
    <div>
      <button onClick={handleSearch}>Search Help</button>
      <button onClick={handleGetContext}>Get Context</button>
    </div>
  )
}
```

## API Reference

### HelpProvider Props

```typescript
interface HelpProviderProps {
  children: ReactNode
  basePath?: string        // Default: 'docs/help'
  autoInitialize?: boolean // Default: true
}
```

### HelpChat Props

```typescript
interface HelpChatProps {
  chatId: string
  models?: Model[]
  className?: string
  compactMode?: boolean
  category?: string
  placeholder?: string
  initialQuery?: string
}
```

### HelpProvider Context

```typescript
interface HelpContextValue {
  isInitialized: boolean
  searchHelp: (query: string, category?: string) => Promise<HelpSearchResult[]>
  getDocument: (id: string) => Promise<HelpDocument | null>
  getCategoryDocuments: (category: string) => Promise<HelpDocument[]>
  getCategories: () => Promise<string[]>
  getFormattedHelp: (query: string, category?: string) => Promise<string>
  refreshHelp: () => Promise<void>
}
```

### API Endpoints

#### GET /api/help

Query Parameters:
- `action`: The action to perform
- `query`: Search query (for search action)
- `category`: Help category (optional)
- `id`: Document ID (for document action)

Actions:
- `categories`: Get all available categories
- `search`: Search help documents
- `document`: Get specific document
- `category`: Get all documents in category
- `formatted`: Get formatted help for AI context

Examples:
```javascript
// Get categories
fetch('/api/help?action=categories')

// Search for help
fetch('/api/help?action=search&query=workflow&category=studio')

// Get formatted help
fetch('/api/help?action=formatted&query=how to create a node')
```

## Configuration

### Environment Configuration

No environment variables are required. The system uses the existing application configuration.

### Content Configuration

Help content is configured through the file system structure:

```
docs/help/
├── studio/           # Category: studio
│   ├── overview.md   # Document: studio/overview
│   └── nodes.md      # Document: studio/nodes
└── main-app/         # Category: main-app
    └── chat.md       # Document: main-app/chat
```

### Component Configuration

#### HelpChat Configuration

```tsx
<HelpChat
  chatId="unique-chat-id"           // Required: Unique identifier
  category="studio"                 // Optional: Help category
  compactMode={false}               // Optional: Compact UI mode
  placeholder="Ask me anything..."  // Optional: Input placeholder
  initialQuery="How do I start?"    // Optional: Initial question
  className="custom-styles"         // Optional: CSS classes
/>
```

#### HelpProvider Configuration

```tsx
<HelpProvider
  basePath="docs/help"     // Optional: Help content path
  autoInitialize={true}    // Optional: Auto-initialize on mount
>
  {/* Children */}
</HelpProvider>
```

## Content Management

### Creating Help Content

1. **Choose a Category**: Create a directory under `docs/help/`
2. **Create Markdown Files**: Use `.md` extension
3. **Follow Naming Convention**: Use descriptive, URL-friendly names
4. **Write Clear Content**: Use headers, lists, and formatting

### Content Guidelines

#### File Structure
```markdown
# Page Title

Brief description of the feature or topic.

## Section Header

Detailed explanation with:
- Bullet points for lists
- Numbered steps for procedures
- Code examples where relevant
- Links to related topics

## Another Section

More detailed information...

## Troubleshooting

Common issues and solutions:
- Issue 1: Solution
- Issue 2: Solution
```

#### Best Practices
- Use clear, descriptive titles
- Include examples and code snippets
- Provide step-by-step instructions
- Anticipate user questions
- Keep content concise but comprehensive
- Use consistent formatting

### Content Categories

#### Studio Category (`docs/help/studio/`)
- `overview.md`: General studio introduction
- `nodes.md`: Node types and usage
- `workflows.md`: Workflow creation and management
- `troubleshooting.md`: Common issues and solutions

#### Main App Category (`docs/help/main-app/`)
- `overview.md`: Main application features
- `chat.md`: Chat system usage
- `search.md`: Search functionality
- `settings.md`: Configuration options

### Updating Content

The system automatically discovers new content when:
1. Files are added to the help directories
2. The server restarts
3. The help system is refreshed programmatically

To refresh content programmatically:
```typescript
const { refreshHelp } = useHelp()
await refreshHelp()
```

## Testing

### Automated Testing

```javascript
// Run all tests
runAllTests()

// Individual test functions
testHelpAPI()      // Test API endpoints
testHelpProvider() // Test React provider
testHelpChat()     // Test chat components
```

### Manual Testing

1. **API Testing**:
   ```bash
   curl "http://localhost:3000/api/help?action=categories"
   curl "http://localhost:3000/api/help?action=search&query=workflow"
   ```

2. **Component Testing**:
   - Visit `/studio` and click the Help button
   - Test different help categories
   - Verify search functionality

3. **Integration Testing**:
   - Test help in different sections of the app
   - Verify context-aware responses
   - Check error handling

### Test Coverage

The test suite covers:
- ✅ API endpoint functionality
- ✅ Document search and retrieval
- ✅ Category management
- ✅ Error handling
- ✅ Component integration
- ✅ Context provider functionality

## Troubleshooting

### Common Issues

#### Help System Not Loading
**Symptoms**: Help components show loading or error states
**Solutions**:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Ensure help content files exist
4. Check network connectivity

#### Search Not Working
**Symptoms**: Search returns no results or irrelevant results
**Solutions**:
1. Verify help content exists in the correct directories
2. Check file permissions on the server
3. Ensure Markdown files are properly formatted
4. Try refreshing the help system

#### Chat Not Responding
**Symptoms**: Help chat doesn't provide responses
**Solutions**:
1. Check if the underlying chat system is working
2. Verify help context is being generated
3. Check API response times
4. Ensure proper error handling

#### Content Not Updating
**Symptoms**: New help content doesn't appear
**Solutions**:
1. Restart the development server
2. Use the refresh function programmatically
3. Check file system permissions
4. Verify file paths and naming

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('help-debug', 'true')
```

### Performance Issues

If the help system is slow:
1. Check server response times
2. Verify caching is working
3. Reduce help content file sizes
4. Optimize search queries

## Best Practices

### Content Creation
- Write clear, concise content
- Use consistent formatting
- Include examples and screenshots
- Anticipate user questions
- Keep content up-to-date

### Component Usage
- Wrap applications with `HelpProvider` at the top level
- Use appropriate specialized components when available
- Provide meaningful `chatId` values
- Handle loading and error states

### Performance
- Use compact mode for constrained spaces
- Implement proper error boundaries
- Cache frequently accessed content
- Monitor API response times

### Accessibility
- Ensure proper ARIA labels
- Support keyboard navigation
- Provide alternative text for icons
- Maintain sufficient color contrast

## Extending the System

### Adding New Categories

1. Create a new directory under `docs/help/`
2. Add Markdown files following the naming convention
3. The system automatically discovers the new category

### Custom Components

```tsx
import { HelpChat } from '@/components/help'

function CustomHelpChat() {
  return (
    <HelpChat
      chatId="custom-help"
      category="my-custom-category"
      placeholder="Ask about my custom feature..."
      initialQuery="What can you help me with?"
      compactMode={true}
    />
  )
}
```

### Custom Help Content Processing

Extend the server-side help system:

```typescript
// In app/api/help/route.ts
class CustomHelpSystem extends ServerHelpSystem {
  // Custom processing logic
  customSearch(query: string): HelpSearchResult[] {
    // Implement custom search logic
  }
}
```

### Integration with External Systems

```typescript
// Integrate with external help systems
const { getFormattedHelp } = useHelp()

const externalHelp = await fetchExternalHelp(query)
const morphicHelp = await getFormattedHelp(query, category)

const combinedHelp = mergeHelpContexts(externalHelp, morphicHelp)
```

## Migration Guide

### From No Help System

1. Add the help system files to your project
2. Create initial help content in `docs/help/`
3. Wrap your app with `HelpProvider`
4. Add help components to relevant pages
5. Test the integration

### From Basic Help System

1. Migrate existing help content to Markdown format
2. Update component imports to use the new help system
3. Replace custom help logic with help system hooks
4. Update styling to match the new components
5. Test all help functionality

### Version Compatibility

- **Next.js 13+**: Fully compatible
- **React 18+**: Required for concurrent features
- **TypeScript 4.5+**: Recommended for full type support

## Support and Contributing

### Getting Help

1. Check this documentation
2. Review the test utilities
3. Check existing issues and solutions
4. Contact the development team

### Contributing

1. Follow the established patterns
2. Add comprehensive tests
3. Update documentation
4. Ensure type safety
5. Test across different environments

### Future Enhancements

Potential improvements:
- Multi-language support
- User feedback integration
- Advanced search features
- Content versioning
- Analytics and usage tracking
- Voice-based help
- Interactive tutorials

---

## Conclusion

The Morphic Help System provides a robust, scalable solution for context-aware user assistance. By leveraging existing infrastructure and following best practices, it offers a seamless experience that can grow with your application's needs.

For questions or issues, refer to the troubleshooting section or contact the development team.