// Agent Studio Types and Interfaces
import { Connection, Edge, Node, NodeProps } from '@xyflow/react'
import { z } from 'zod'

export interface AgentNodeData {
  type: 'researcher' | 'manual-researcher' | 'generate-related-questions'
  config: {
    model: string
    temperature: number
    maxSteps: number
    tools: string[]
  }
  status: 'idle' | 'running' | 'completed' | 'error'
  executionStats?: {
    runCount: number
    avgDuration: number
    successRate: number
  }
}

export interface ToolNodeData {
  type: 'search' | 'retrieve' | 'shopping' | 'video-search' | 'question'
  config: {
    provider: string
    parameters: Record<string, any>
    retryCount: number
  }
  executionStats: {
    runCount: number
    avgDuration: number
    successRate: number
  }
}

export interface DataNodeData {
  type: 'input' | 'output' | 'variable'
  config: {
    dataType: string
    defaultValue?: any
    validation?: {
      required: boolean
      schema?: any
    }
  }
  value?: any
}

export interface LogicNodeData {
  type: 'condition' | 'loop' | 'transformer'
  config: {
    condition?: string
    loopCount?: number
    transformFunction?: string
  }
}

export interface UINodeData {
  type: 'panel-generator' | 'notification'
  config: {
    panelType?: string
    notificationType?: string
    template?: string
  }
}

export type NodeData = AgentNodeData | ToolNodeData | DataNodeData | LogicNodeData | UINodeData

export interface WorkflowDefinition {
  id: string
  name: string
  nodes: Node[]
  connections: Connection[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    author: string
  }
}

export interface ExecutionResult {
  success: boolean
  data: any
  errors: string[]
  executionTime: number
  nodeResults: Record<string, any>
}

export interface DataFlow {
  from: string
  to: string
  data: any
  timestamp: number
  metadata: {
    size: number
    type: string
    processingTime: number
  }
}

export interface WorkflowMetrics {
  totalExecutionTime: number
  nodeExecutionTimes: Record<string, number>
  dataTransferSizes: Record<string, number>
  errorRates: Record<string, number>
  bottleneckAnalysis: Bottleneck[]
}

export interface Bottleneck {
  nodeId: string
  issue: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
}

export interface NodePlugin {
  type: string
  component: React.ComponentType<NodeProps>
  configSchema: z.ZodSchema
  execute: (config: any, inputs: any[]) => Promise<any>
  icon: string
  category: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  nodes: Node[]
  connections: Connection[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    author: string
  }
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'research' | 'shopping' | 'analysis' | 'automation' | 'custom'
  tags: string[]
  nodes: Node[]
  edges: Edge[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    author: string
    usageCount: number
    rating: number
  }
}

export interface ComponentDefinition {
  id: string
  name: string
  type: 'agent' | 'tool' | 'panel' | 'logic'
  description: string
  category: string
  configuration: Record<string, any>
  workflow?: WorkflowTemplate
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    author: string
  }
}

export interface TemplateLibrary {
  workflows: WorkflowTemplate[]
  components: ComponentDefinition[]
  categories: string[]
}

// Types are imported above for use in interfaces