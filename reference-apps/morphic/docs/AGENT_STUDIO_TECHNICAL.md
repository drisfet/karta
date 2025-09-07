# Agent Studio Technical Documentation

## Architecture Overview

The Agent Studio is a sophisticated React-based visual workflow editor built on top of React Flow, integrated seamlessly with the existing Morphic agent system. This document provides technical details for developers working with or extending the Agent Studio.

## 🏗️ System Architecture

### Core Components

```
Agent Studio/
├── app/studio/page.tsx                    # Main studio interface with floating toolbar
├── components/studio/
│   ├── nodes/                             # Node type implementations
│   │   ├── AgentNode.tsx                 # Agent node component (Researcher, Manual, Related Questions)
│   │   ├── ToolNode.tsx                  # Tool node component (Search, Retrieve, Shopping, Video, Question)
│   │   ├── DataNode.tsx                  # Data node component (Input, Output, Variable)
│   │   ├── LogicNode.tsx                 # Logic node component (Condition, Loop, Transformer)
│   │   ├── UINode.tsx                    # UI node component (Panel Generator, Notification)
│   │   └── index.ts                      # Node exports
│   ├── NodePalette.tsx                   # Drag-and-drop palette with all node types
│   ├── PropertyPanel.tsx                 # Dynamic configuration panel
│   ├── DataFlowEdge.tsx                  # Custom edge with animation
│   ├── ExecutionMonitor.tsx              # Real-time execution monitoring
│   └── TemplateLibrary.tsx               # Template management interface
├── lib/studio/
│   ├── workflow-engine.ts                # Execution engine
│   ├── workflow-engine-client.ts         # Client-safe execution engine
│   ├── template-manager.ts               # Template save/load system
│   ├── performance-optimizer.ts          # Performance optimization utilities
│   ├── component-registry.ts             # Component registry system
│   └── integration-example.ts            # Main app integration examples
├── lib/types/studio.ts                   # Shared type definitions
└── docs/
    ├── AGENT_STUDIO_GUIDE.md            # User guide
    └── AGENT_STUDIO_TECHNICAL.md        # Technical documentation
```

### Dependencies

```json
{
  "@xyflow/react": "^latest",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0"
}
```

## 🔧 Node System Architecture

### Base Node Interface

```typescript
interface BaseNodeData {
  status: 'idle' | 'running' | 'completed' | 'error'
  executionStats?: {
    runCount: number
    avgDuration: number
    successRate: number
  }
}
```

### Node Type Registration

```typescript
const nodeTypes = {
  agentNode: AgentNode,      // Researcher, Manual Researcher, Generate Related Questions
  toolNode: ToolNode,        // Search, Retrieve, Shopping, Video Search, Question
  dataNode: DataNode,        // Input, Output, Variable
  logicNode: LogicNode,      // Condition, Loop, Transformer
  uiNode: UINode,           // Panel Generator, Notification
}
```

### Custom Node Implementation

```typescript
export function CustomNode({ data }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData

  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        {/* Node-specific UI */}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
```

## 📚 Template System & Component Creation

### Hybrid Approach Architecture

The Agent Studio implements a **hybrid approach** that allows users to create custom components without requiring complex code generation:

#### Template Management System
```typescript
class TemplateManager {
  // Save workflows as reusable templates
  static saveWorkflowTemplate(
    name: string,
    description: string,
    category: WorkflowTemplate['category'],
    tags: string[],
    nodes: Node[],
    edges: Edge[]
  ): WorkflowTemplate

  // Load templates from storage
  static getWorkflowTemplates(): WorkflowTemplate[]

  // Export/import functionality
  static exportWorkflowTemplate(templateId: string): string | null
  static importWorkflowTemplate(templateJson: string): WorkflowTemplate | null
}
```

#### Component Registry System
```typescript
class ComponentRegistry {
  private static instance: ComponentRegistry
  private workflows: Map<string, WorkflowTemplate> = new Map()
  private components: Map<string, ComponentDefinition> = new Map()

  // Singleton pattern for global access
  static getInstance(): ComponentRegistry

  // Real-time component discovery
  registerWorkflow(workflow: WorkflowTemplate): void
  registerComponent(component: ComponentDefinition): void

  // Search and filtering
  searchWorkflows(query: string): WorkflowTemplate[]
  getWorkflowsByCategory(category: string): WorkflowTemplate[]
}
```

### Component Creation Workflow

#### 1. Visual Design Phase
```typescript
// User creates workflow visually in Agent Studio
const workflow = {
  nodes: [
    { id: '1', type: 'agentNode', data: { /* agent config */ } },
    { id: '2', type: 'toolNode', data: { /* tool config */ } },
    { id: '3', type: 'dataNode', data: { /* data config */ } }
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' }
  ]
}
```

#### 2. Template Creation Phase
```typescript
// Save as reusable template
const template = TemplateManager.saveWorkflowTemplate(
  "Custom Research Agent",
  "Advanced research with search and analysis",
  "research",
  ["research", "search", "analysis"],
  workflow.nodes,
  workflow.edges
)
```

#### 3. Component Registration Phase
```typescript
// Automatically registered with main application
componentRegistry.registerWorkflow(template)

// Now available in main app
const availableWorkflows = componentRegistry.getAllWorkflows()
```

### Main Application Integration

#### Automatic Component Discovery
```typescript
// In main app initialization
import { componentRegistry } from '@/lib/studio/component-registry'

// Setup real-time discovery
componentRegistry.addListener((type, action, id) => {
  if (type === 'workflow' && action === 'add') {
    console.log(`New workflow available: ${id}`)
    refreshWorkflowList()
  }
})

// Get available components
const workflows = componentRegistry.getAllWorkflows()
const components = componentRegistry.getAllComponents()
```

#### Component Usage in Main App
```typescript
// Execute studio-created workflow
const result = await executeWorkflowById(workflowId)

// Create agent from studio template
const customAgent = createAgentFromWorkflow(workflowId)

// Use in existing agent selection
const agentOptions = [
  ...existingAgents,
  ...workflows.filter(w => w.category === 'research')
]
```

## 🔄 Workflow Execution Engine

### Core Classes

```typescript
class WorkflowExecutor {
  constructor(
    nodes: Node[],
    edges: Edge[],
    onNodeUpdate: (nodeId: string, data: any) => void,
    onExecutionComplete: (result: ExecutionResult) => void,
    onDataFlow?: (sourceId: string, targetId: string, data: any) => void
  )

  async execute(): Promise<ExecutionResult>
  private async executeNode(): Promise<void>
  private findStartingNodes(): Node[]
  private findDownstreamNodes(): Node[]
}
```

### Execution Flow

1. **Initialization**: Reset all node statuses to 'idle'
2. **Topological Sort**: Identify starting nodes (no incoming connections)
3. **Sequential Execution**: Execute nodes in dependency order
4. **Data Flow**: Trigger visual data flow animations
5. **Completion**: Aggregate results and performance metrics

### Integration with Morphic Agents

```typescript
// Direct integration with existing agent functions
import { researcher, manualResearcher } from '@/lib/agents'

// Tool integration
import {
  createSearchTool,
  retrieveTool,
  createShoppingTool,
  createVideoSearchTool
} from '@/lib/tools'
```

## 🎨 Data Flow Visualization

### Custom Edge Component

```typescript
export function DataFlowEdge({ ...edgeProps }) {
  const isFlowing = data?.isFlowing || false
  const flowData = data?.flowData

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: isFlowing ? 3 : 2,
          stroke: isFlowing ? '#10b981' : '#64748b',
          filter: isFlowing ? 'drop-shadow(...)' : 'none'
        }}
      />
      {isFlowing && <AnimatedFlowIndicator />}
      {flowData && <DataFlowLabel />}
    </>
  )
}
```

### Flow Animation System

```typescript
const updateDataFlow = (sourceId: string, targetId: string, data: any) => {
  setEdges(edges =>
    edges.map(edge => {
      if (edge.source === sourceId && edge.target === targetId) {
        return {
          ...edge,
          data: {
            ...edge.data,
            isFlowing: true,
            flowData: data
          }
        }
      }
      return edge
    })
  )

  // Auto-stop animation after 2 seconds
  setTimeout(() => stopDataFlow(sourceId, targetId), 2000)
}
```

## ⚙️ Configuration System

### Dynamic Property Panels

```typescript
export function PropertyPanel({ selectedNode, onNodeUpdate }) {
  const renderNodeProperties = () => {
    switch (selectedNode.type) {
      case 'agentNode':
        return <AgentNodeProperties />
      case 'toolNode':
        return <ToolNodeProperties />
      // ... other node types
    }
  }

  return (
    <Card>
      <CardContent>
        {renderNodeProperties()}
      </CardContent>
    </Card>
  )
}
```

### Form Components

```typescript
// Reusable form components
import {
  Input, Select, Slider, Switch, Textarea
} from '@/components/ui'

// Type-safe configuration
interface AgentConfig {
  model: string
  temperature: number
  maxSteps: number
  tools: string[]
}
```

## 🔌 Integration Points

### Morphic Agent System

```typescript
// Agent execution integration
const agentConfig = agentFunction({
  messages: userMessages,
  model: nodeData.config.model,
  searchMode: nodeData.type === 'researcher'
})

// Tool execution integration
const toolResult = await tool.execute(parameters, context)
```

### UI Panel System

```typescript
// Panel generation integration
const panelData = {
  id: generatedId,
  type: 'ANSWER',
  props: resultData,
  position: calculatedPosition,
  size: defaultSize
}
```

### Search and Retrieval

```typescript
// Search integration
const searchResults = await searchTool.execute({
  query: userQuery,
  max_results: 20,
  search_depth: 'advanced'
})

// Content retrieval
const retrievedContent = await retrieveTool.execute({
  url: targetUrl
})
```

## 🎯 State Management

### React Flow State

```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
const [selectedNode, setSelectedNode] = useState<Node | null>(null)
const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
```

### Node Update System

```typescript
const onNodeUpdate = useCallback((nodeId: string, data: any) => {
  setNodes(nodes =>
    nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } }
        : node
    )
  )
}, [setNodes])
```

## 🚀 Performance Optimizations

### Lazy Loading

```typescript
// Dynamic imports for large components
const DataFlowEdge = lazy(() => import('./DataFlowEdge'))
const PropertyPanel = lazy(() => import('./PropertyPanel'))
```

### Memoization

```typescript
const nodeTypes = useMemo(() => ({
  agentNode: AgentNode,
  toolNode: ToolNode,
  // ... other nodes
}), [])

const edgeTypes = useMemo(() => ({
  dataFlow: DataFlowEdge
}), [])
```

### Virtualization

```typescript
// For large workflows with many nodes
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  fitView
  minZoom={0.1}
  maxZoom={2}
>
  <MiniMap />
  <Controls />
</ReactFlow>
```

## 🔧 Extension Points

### Custom Node Types

```typescript
// Define custom node data interface
interface CustomNodeData extends BaseNodeData {
  customProperty: string
  customConfig: CustomConfig
}

// Implement custom node component
export function CustomNode({ data }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData

  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      <div>{nodeData.customProperty}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

// Register in node types
const nodeTypes = {
  ...existingNodeTypes,
  customNode: CustomNode
}
```

### Plugin System

```typescript
interface NodePlugin {
  type: string
  component: React.ComponentType<NodeProps>
  configSchema: z.ZodSchema
  execute: (config: any, inputs: any[]) => Promise<any>
  icon: string
  category: string
}

// Plugin registration
const registerPlugin = (plugin: NodePlugin) => {
  nodeTypes[plugin.type] = plugin.component
  // Add to palette, property panels, etc.
}
```

### Template System

```typescript
interface WorkflowTemplate {
  id: string
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
  category: string
  tags: string[]
}

// Template loading
const loadTemplate = (template: WorkflowTemplate) => {
  setNodes(template.nodes)
  setEdges(template.edges)
  // Reset execution state
}
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Node component tests
describe('AgentNode', () => {
  it('renders with correct status indicators', () => {
    render(<AgentNode data={mockData} />)
    expect(screen.getByText('Researcher Agent')).toBeInTheDocument()
  })
})

// Workflow engine tests
describe('WorkflowExecutor', () => {
  it('executes nodes in correct order', async () => {
    const executor = new WorkflowExecutor(nodes, edges, onUpdate, onComplete)
    const result = await executor.execute()
    expect(result.success).toBe(true)
  })
})
```

### Integration Tests

```typescript
// End-to-end workflow execution
describe('Workflow Integration', () => {
  it('executes complete research workflow', async () => {
    // Setup workflow with agent, tools, and data nodes
    // Execute and verify results
    // Check data flow visualization
  })
})
```

## 📊 Monitoring & Analytics

### Performance Metrics

```typescript
interface WorkflowMetrics {
  totalExecutionTime: number
  nodeExecutionTimes: Record<string, number>
  dataTransferSizes: Record<string, number>
  errorRates: Record<string, number>
  bottleneckAnalysis: Bottleneck[]
}

// Metrics collection
const collectMetrics = (executionResult: ExecutionResult): WorkflowMetrics => {
  return {
    totalExecutionTime: executionResult.executionTime,
    nodeExecutionTimes: calculateNodeTimes(executionResult.nodeResults),
    // ... other metrics
  }
}
```

### Error Tracking

```typescript
// Error boundary for node components
class NodeErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error, update node status, show user feedback
    this.props.onNodeError(this.props.nodeId, error)
  }
}
```

## 🔒 Security Considerations

### Input Validation

```typescript
// Zod schemas for runtime validation
const AgentNodeSchema = z.object({
  type: z.enum(['researcher', 'manual-researcher']),
  config: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(2),
    maxSteps: z.number().min(1).max(10)
  })
})

// Runtime validation
const validateNodeData = (data: any, schema: z.ZodSchema) => {
  try {
    return schema.parse(data)
  } catch (error) {
    throw new ValidationError('Invalid node configuration', error)
  }
}
```

### Secure Execution

```typescript
// Sandbox execution environment
const executeInSandbox = async (code: string, context: any) => {
  // Execute node logic in isolated environment
  // Prevent access to sensitive APIs
  // Limit execution time and resources
}
```

## 🚀 Deployment & Scaling

### Build Optimization

```javascript
// next.config.js optimizations
module.exports = {
  experimental: {
    optimizePackageImports: ['@xyflow/react']
  },
  webpack: (config) => {
    // Custom webpack optimizations for React Flow
    config.resolve.alias['@xyflow/react'] = path.resolve(
      __dirname,
      'node_modules/@xyflow/react/dist/esm/index.js'
    )
    return config
  }
}
```

### CDN Integration

```html
<!-- Load React Flow from CDN for better caching -->
<script src="https://unpkg.com/@xyflow/react/dist/umd/index.js"></script>
```

## 📚 API Reference

### Template Management System

```typescript
class TemplateManager {
  // Save workflow as template
  static saveWorkflowTemplate(
    name: string,
    description: string,
    category: WorkflowTemplate['category'],
    tags: string[],
    nodes: Node[],
    edges: Edge[]
  ): WorkflowTemplate

  // Load templates
  static getWorkflowTemplates(): WorkflowTemplate[]
  static loadWorkflowTemplate(templateId: string): WorkflowTemplate | null

  // Export/Import
  static exportWorkflowTemplate(templateId: string): string | null
  static importWorkflowTemplate(templateJson: string): WorkflowTemplate | null

  // Search and filtering
  static searchTemplates(query: string): WorkflowTemplate[]
  static getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[]
}
```

### Component Registry System

```typescript
class ComponentRegistry {
  // Singleton access
  static getInstance(): ComponentRegistry

  // Component registration
  registerWorkflow(workflow: WorkflowTemplate): void
  registerComponent(component: ComponentDefinition): void

  // Component retrieval
  getWorkflow(workflowId: string): WorkflowTemplate | undefined
  getComponent(componentId: string): ComponentDefinition | undefined
  getAllWorkflows(): WorkflowTemplate[]
  getAllComponents(): ComponentDefinition[]

  // Search and filtering
  searchWorkflows(query: string): WorkflowTemplate[]
  searchComponents(query: string): ComponentDefinition[]
  getWorkflowsByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[]
  getComponentsByType(type: ComponentDefinition['type']): ComponentDefinition[]

  // Event system
  addListener(listener: (type: 'workflow' | 'component', action: 'add' | 'update' | 'delete', id: string) => void): void
  removeListener(listener: (type: 'workflow' | 'component', action: 'add' | 'update' | 'delete', id: string) => void): void
}
```

### Main Application Integration

```typescript
// Helper functions for main app integration
import {
  getAvailableWorkflows,
  getAvailableComponents,
  executeWorkflowById,
  getWorkflowById,
  getComponentById
} from '@/lib/studio/component-registry'

// Get all studio-created components
const workflows = getAvailableWorkflows()
const components = getAvailableComponents()

// Execute a studio workflow
const result = await executeWorkflowById(workflowId)

// Get specific components
const workflow = getWorkflowById(workflowId)
const component = getComponentById(componentId)
```

### WorkflowExecutor

```typescript
class WorkflowExecutor {
  constructor(
    nodes: Node[],
    edges: Edge[],
    onNodeUpdate: (nodeId: string, data: any) => void,
    onExecutionComplete: (result: ExecutionResult) => void,
    onDataFlow?: (sourceId: string, targetId: string, data: any) => void
  )

  execute(): Promise<ExecutionResult>
}
```

### Node Components

```typescript
interface NodeProps {
  id: string
  data: any
  selected?: boolean
  dragging?: boolean
}

// All node components follow this pattern
function NodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as NodeDataType
  // Component implementation
}
```

### Edge Components

```typescript
interface EdgeProps {
  id: string
  source: string
  target: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  data?: any
  style?: React.CSSProperties
}
```

## 🔄 Current Capabilities & Future Enhancements

### ✅ Implemented Features

#### Hybrid Component Creation System
- **Template-Based Creation**: Save workflows as reusable components
- **Component Registry**: Global registry with real-time synchronization
- **Export/Import System**: Share components across instances
- **Main App Integration**: Automatic component discovery
- **Visual Component Design**: No-code component creation
- **Floating Toolbar**: Quick access to Save, Run, Debug, and New buttons
- **Advanced Node Types**: Generate Related Questions agent, Question tool
- **Real-time Execution Monitoring**: Live status updates and data flow visualization
- **Performance Optimization**: Lazy loading and efficient resource management

#### Advanced Template System
- **Persistent Storage**: localStorage-based template management
- **Search & Filtering**: Find templates by category, tags, or content
- **Usage Tracking**: Monitor template popularity and performance
- **Version Control**: Template versioning and metadata tracking

#### Component Registry Architecture
- **Singleton Pattern**: Global component access across the application
- **Event-Driven Updates**: Real-time component synchronization
- **Type-Safe Operations**: Full TypeScript support for all operations
- **Performance Optimized**: Efficient storage and retrieval

### 🚀 Future Enhancements

#### Immediate Priorities
1. **Enhanced UI Components**
   - Artifact component integration for rich results display
   - Inspector components for advanced debugging
   - Dynamic search provider selection
   - Panel type selection system

2. **Advanced Analytics**
    - Workflow performance dashboards
    - Execution metrics and bottleneck analysis
    - Predictive optimization suggestions
    - Usage pattern analysis

#### Advanced Features
3. **Collaborative Features**
   - Real-time multi-user workflow editing
   - Conflict resolution and merge strategies
   - User presence indicators and comments
   - Team workflow sharing

4. **Code Generation**
   - Convert visual workflows to actual code
   - Plugin generation from templates
   - API endpoint creation
   - Automated testing generation

5. **AI-Powered Features**
   - Auto-completion for workflow creation
   - Intelligent node suggestions
   - Automated workflow optimization
   - Smart error detection and correction

### Extension Points

#### Current Extension Points
- **Custom Node Types**: Add new node types to the palette
- **Template Categories**: Create custom template categories
- **Component Metadata**: Extend component metadata schema
- **Integration Hooks**: Custom integration with external systems

#### Future Extension Points
- **Plugin Marketplace**: Centralized plugin distribution system
- **Custom Execution Engines**: Alternative workflow execution strategies
- **External Data Sources**: Integration with third-party APIs
- **Custom UI Themes**: Personalized studio appearance
- **Workflow Templates**: Community-contributed template library

---

This technical documentation provides the foundation for understanding, extending, and maintaining the Agent Studio. For questions or contributions, please refer to the main project documentation or create an issue in the repository.