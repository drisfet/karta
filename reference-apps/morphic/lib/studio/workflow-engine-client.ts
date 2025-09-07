import { Edge,Node } from '@xyflow/react'

import { ExecutionResult } from '@/lib/types/studio'

// Client-safe workflow executor that doesn't import server-side utilities
export class ClientWorkflowExecutor {
  private nodes: Node[]
  private edges: Edge[]
  private onNodeUpdate: (nodeId: string, data: any) => void
  private onExecutionComplete: (result: ExecutionResult) => void
  private onDataFlow?: (sourceId: string, targetId: string, data: any) => void

  constructor(
    nodes: Node[],
    edges: Edge[],
    onNodeUpdate: (nodeId: string, data: any) => void,
    onExecutionComplete: (result: ExecutionResult) => void,
    onDataFlow?: (sourceId: string, targetId: string, data: any) => void
  ) {
    this.nodes = nodes
    this.edges = edges
    this.onNodeUpdate = onNodeUpdate
    this.onExecutionComplete = onExecutionComplete
    this.onDataFlow = onDataFlow
  }

  async execute(): Promise<ExecutionResult> {
    const startTime = Date.now()
    const results: Record<string, any> = {}
    const errors: string[] = []

    try {
      // Find starting nodes (nodes with no incoming connections)
      const startingNodes = this.findStartingNodes()

      // Execute nodes in topological order
      for (const node of startingNodes) {
        await this.executeNode(node, results, errors)
      }

      const executionTime = Date.now() - startTime
      const result: ExecutionResult = {
        success: errors.length === 0,
        data: results,
        errors,
        executionTime,
        nodeResults: results
      }

      this.onExecutionComplete(result)
      return result

    } catch (error) {
      const executionTime = Date.now() - startTime
      const result: ExecutionResult = {
        success: false,
        data: results,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
        executionTime,
        nodeResults: results
      }

      this.onExecutionComplete(result)
      return result
    }
  }

  private findStartingNodes(): Node[] {
    const nodesWithIncoming = new Set(
      this.edges.map(edge => edge.target)
    )

    return this.nodes.filter(node => !nodesWithIncoming.has(node.id))
  }

  private async executeNode(
    node: Node,
    results: Record<string, any>,
    errors: string[]
  ): Promise<void> {
    // Update node status to running
    this.onNodeUpdate(node.id, { status: 'running' })

    try {
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      let result: any = null

      // Execute based on node type
      switch (node.type) {
        case 'agentNode':
          result = await this.executeAgentNode(node)
          break
        case 'toolNode':
          result = await this.executeToolNode(node)
          break
        case 'dataNode':
          result = await this.executeDataNode(node)
          break
        case 'logicNode':
          result = await this.executeLogicNode(node)
          break
        case 'uiNode':
          result = await this.executeUINode(node)
          break
        default:
          result = { message: 'Unknown node type executed' }
      }

      results[node.id] = result

      // Update node status to completed
      this.onNodeUpdate(node.id, { status: 'completed' })

      // Trigger data flow visualization
      if (this.onDataFlow) {
        const downstreamEdges = this.edges.filter(edge => edge.source === node.id)
        for (const edge of downstreamEdges) {
          this.onDataFlow(node.id, edge.target, result)
        }
      }

      // Execute downstream nodes
      const downstreamNodes = this.findDownstreamNodes(node.id)
      for (const downstreamNode of downstreamNodes) {
        await this.executeNode(downstreamNode, results, errors)
      }

    } catch (error) {
      errors.push(`Node ${node.id}: ${error instanceof Error ? error.message : 'Execution failed'}`)
      this.onNodeUpdate(node.id, { status: 'error' })
    }
  }

  private findDownstreamNodes(nodeId: string): Node[] {
    const downstreamNodeIds = this.edges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target)

    return this.nodes.filter(node => downstreamNodeIds.includes(node.id))
  }

  private async executeAgentNode(node: Node): Promise<any> {
    const data = node.data as any

    // Client-side simulation - in real implementation, this would call server actions
    if (data.type === 'generate-related-questions') {
      return {
        agentType: data.type,
        model: data.config.model,
        questions: [
          'What are the key challenges in this area?',
          'How does this compare to existing solutions?',
          'What are the potential future developments?'
        ],
        output: `Generated 3 related questions`
      }
    }

    return {
      agentType: data.type,
      model: data.config.model,
      steps: Math.floor(Math.random() * data.config.maxSteps) + 1,
      output: `Agent ${data.type} completed research`
    }
  }

  private async executeToolNode(node: Node): Promise<any> {
    const data = node.data as any

    // Client-side simulation - in real implementation, this would call server actions
    switch (data.type) {
      case 'search':
        return {
          toolType: data.type,
          provider: data.config.provider,
          results: `Search completed with ${Math.floor(Math.random() * 20) + 5} results`,
          duration: Math.random() * 2 + 0.5
        }
      case 'retrieve':
        return {
          toolType: data.type,
          provider: data.config.provider,
          results: 'Content retrieved successfully',
          duration: Math.random() * 1 + 0.3
        }
      case 'shopping':
        return {
          toolType: data.type,
          provider: data.config.provider,
          results: `Found ${Math.floor(Math.random() * 10) + 3} products`,
          duration: Math.random() * 1.5 + 0.5
        }
      case 'video-search':
        return {
          toolType: data.type,
          provider: data.config.provider,
          results: `Found ${Math.floor(Math.random() * 15) + 5} videos`,
          duration: Math.random() * 2.5 + 1
        }
      case 'question':
        return {
          question: 'Would you like to provide more details?',
          options: ['Yes', 'No', 'Maybe'],
          type: 'clarification'
        }
      default:
        return {
          toolType: data.type,
          results: 'Tool executed successfully',
          duration: Math.random() * 1 + 0.2
        }
    }
  }

  private async executeDataNode(node: Node): Promise<any> {
    const data = node.data as any

    return {
      dataType: data.config.dataType,
      processed: true,
      value: data.config.defaultValue || 'processed data'
    }
  }

  private async executeLogicNode(node: Node): Promise<any> {
    const data = node.data as any

    return {
      logicType: data.type,
      executed: true,
      result: `Logic ${data.type} processed`
    }
  }

  private async executeUINode(node: Node): Promise<any> {
    const data = node.data as any

    return {
      uiType: data.type,
      generated: true,
      content: `UI ${data.type} rendered`
    }
  }
}

export function createClientWorkflowExecutor(
  nodes: Node[],
  edges: Edge[],
  onNodeUpdate: (nodeId: string, data: any) => void,
  onExecutionComplete: (result: ExecutionResult) => void,
  onDataFlow?: (sourceId: string, targetId: string, data: any) => void
): ClientWorkflowExecutor {
  return new ClientWorkflowExecutor(nodes, edges, onNodeUpdate, onExecutionComplete, onDataFlow)
}