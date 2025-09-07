# High-Fidelity Interactive Panel System

A robust, modular, and extensible panel system designed for LangChain agents to autonomously generate and manipulate interactive panels in the Perplexity++ research workspace.

## Overview

The panel system provides a comprehensive framework for creating dynamic, interactive panels that can be controlled by AI agents. It supports multiple panel types, real-time manipulation, and seamless integration with LangChain workflows.

## Architecture

### Core Components

1. **Panel Registry** (`panel-registry.tsx`)
   - Central registry for all panel types
   - Factory pattern for panel creation
   - Type-safe panel configuration

2. **Panel Renderer** (`panel-renderer.tsx`)
   - Main rendering component
   - Manages panel lifecycle and state
   - Exposes API for LangChain agents

3. **Panel Types** (`types/`)
   - Individual panel implementations
   - Specialized components for different data types
   - Consistent interface across all panels

## Panel Types

### ANSWER Panel
- **Purpose**: Display AI-generated answers with citations
- **Features**:
  - HTML content rendering
  - Inline citation support
  - Follow-up question capability
  - Real-time content updates

### SOURCES Panel
- **Purpose**: Display source materials and references
- **Features**:
  - Source list with favicons
  - Clickable links
  - Snippet previews
  - Citation linking

### IMAGES Panel (Planned)
- **Purpose**: Display image results and galleries
- **Features**:
  - Image grid layout
  - Lightbox viewing
  - AI-generated image hints

### CHART Panel (Planned)
- **Purpose**: Display data visualizations
- **Features**:
  - Multiple chart types
  - Interactive data exploration
  - Export capabilities

### MAP Panel (Planned)
- **Purpose**: Display geographic data
- **Features**:
  - Interactive maps
  - Location markers
  - Route visualization

### SHOPPING Panel (Planned)
- **Purpose**: Display product recommendations
- **Features**:
  - Product cards
  - Price comparison
  - Purchase links

### NOTES Panel (Planned)
- **Purpose**: Collaborative note-taking
- **Features**:
  - Rich text editing
  - Real-time collaboration
  - Version history

### DOC_VIEWER Panel (Planned)
- **Purpose**: Display documents and files
- **Features**:
  - PDF viewing
  - Document search
  - Annotation support

## LangChain Agent Integration

### Global Panel API

LangChain agents can access the panel system through the global `window.panelAPI` object:

```typescript
// Available in browser environment
declare global {
  interface Window {
    panelAPI: PanelAPI;
  }
}
```

### Panel API Methods

#### Create Panel
```typescript
const panelId = window.panelAPI.createPanel(
  'ANSWER',           // Panel type
  'Search Results',   // Title
  {                    // Props
    html: '<p>Answer content...</p>',
    citations: [...]
  },
  {                    // Options
    position: { x: 100, y: 100 },
    size: { width: 600, height: 400 }
  }
);
```

#### Update Panel
```typescript
window.panelAPI.updatePanel(panelId, {
  title: 'Updated Title',
  props: { html: '<p>New content...</p>' },
  position: { x: 200, y: 150 }
});
```

#### Control Panel State
```typescript
window.panelAPI.focusPanel(panelId);
window.panelAPI.minimizePanel(panelId);
window.panelAPI.closePanel(panelId);
```

### LangChain Tool Integration

Create a custom LangChain tool for panel manipulation:

```typescript
import { Tool } from '@langchain/core/tools';

class PanelManipulationTool extends Tool {
  name = 'panel_manipulator';
  description = 'Create and manipulate interactive panels in the research workspace';

  async _call(input: string): Promise<string> {
    try {
      const command = JSON.parse(input);

      switch (command.action) {
        case 'create_answer_panel':
          const panelId = window.panelAPI.createPanel('ANSWER', command.title, command.props);
          return `Created answer panel with ID: ${panelId}`;

        case 'update_panel_content':
          window.panelAPI.updatePanel(command.panelId, { props: command.props });
          return `Updated panel ${command.panelId}`;

        case 'create_sources_panel':
          const sourcesId = window.panelAPI.createPanel('SOURCES', 'Sources', {
            sources: command.sources
          });
          return `Created sources panel with ID: ${sourcesId}`;

        default:
          return 'Unknown panel action';
      }
    } catch (error) {
      return `Error manipulating panel: ${error.message}`;
    }
  }
}
```

### Example LangChain Workflow

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIAgent } from 'langchain/agents';
import { PanelManipulationTool } from './tools/panel-manipulation';

const model = new ChatOpenAI({ temperature: 0 });
const tools = [new PanelManipulationTool()];

const agent = await createOpenAIAgent({
  llm: model,
  tools,
  prompt: `You are a research assistant that can create interactive panels.

When answering questions:
1. Create an ANSWER panel with your response
2. If you have sources, create a SOURCES panel
3. Position panels logically on the screen
4. Use citations in your answer that link to the sources panel

Always respond with panel creation commands in JSON format.`
});

const executor = AgentExecutor.fromAgentAndTools({
  agent,
  tools,
  verbose: true
});

// Execute research query
await executor.call({
  input: 'What are the latest developments in quantum computing?'
});
```

## Panel Configuration

### Panel Config Interface

```typescript
interface PanelConfig {
  type: PanelType;
  title: string;
  props: Record<string, any>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  zIndex?: number;
  isMinimized?: boolean;
  isPinned?: boolean;
}
```

### Default Configurations

Each panel type has sensible defaults:

```typescript
const defaults = {
  ANSWER: {
    size: { width: 550, height: 600 },
    position: { x: 100, y: 100 }
  },
  SOURCES: {
    size: { width: 400, height: 500 },
    position: { x: 700, y: 100 }
  }
};
```

## Best Practices

### For LangChain Agents

1. **Logical Panel Placement**: Position related panels near each other
2. **Consistent Naming**: Use descriptive titles for panels
3. **Progressive Disclosure**: Start with summary panels, expand with detail panels
4. **State Management**: Track panel IDs for updates and references
5. **Error Handling**: Always handle panel creation failures gracefully

### For Panel Developers

1. **Type Safety**: Use strict TypeScript interfaces
2. **Performance**: Implement virtualization for large datasets
3. **Accessibility**: Support keyboard navigation and screen readers
4. **Responsive Design**: Ensure panels work on different screen sizes
5. **Memory Management**: Clean up event listeners and resources

## Extensibility

### Adding New Panel Types

1. Create panel component in `types/`
2. Register in `panel-registry.tsx`
3. Add TypeScript interfaces
4. Update panel API documentation

### Custom Panel Behaviors

```typescript
interface CustomPanelProps extends PanelComponentProps {
  config: BasePanelConfig & {
    type: 'CUSTOM';
    props: {
      customData: any;
    };
  };
}
```

## Performance Considerations

- **Lazy Loading**: Panels are loaded on demand
- **Virtual Scrolling**: For large content lists
- **Debounced Updates**: Prevent excessive re-renders
- **Memory Cleanup**: Proper cleanup on panel destruction

## Security

- **Input Sanitization**: All panel content is sanitized
- **CSP Compliance**: Content Security Policy friendly
- **XSS Protection**: Safe HTML rendering
- **Origin Validation**: Validate external content sources

## Future Enhancements

- **Panel Templates**: Pre-configured panel layouts
- **Panel Groups**: Logical grouping of related panels
- **Panel History**: Undo/redo for panel operations
- **Collaborative Panels**: Real-time multi-user editing
- **Panel Analytics**: Usage tracking and optimization