import { Edge,Node } from '@xyflow/react'
import { CoreMessage } from 'ai'
import { streamText } from 'ai'

import { generateRelatedQuestions } from '@/lib/agents/generate-related-questions'
import { manualResearcher } from '@/lib/agents/manual-researcher'
import { researcher } from '@/lib/agents/researcher'
import { createQuestionTool } from '@/lib/tools/question'
import { retrieveTool } from '@/lib/tools/retrieve'
import { createSearchTool } from '@/lib/tools/search'
import { createShoppingTool } from '@/lib/tools/shopping'
import { createVideoSearchTool } from '@/lib/tools/video-search'
import { DataFlow,ExecutionResult, WorkflowDefinition } from '@/lib/types/studio'

export class WorkflowExecutor {
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

    try {
      // Create messages for the agent
      const messages: CoreMessage[] = [
        {
          role: 'user',
          content: 'Execute this workflow step with the configured parameters.'
        }
      ]

      // Choose the appropriate agent function
      let agentFunction: any
      if (data.type === 'researcher') {
        agentFunction = researcher
      } else if (data.type === 'manual-researcher') {
        agentFunction = manualResearcher
      } else if (data.type === 'generate-related-questions') {
        // For generateRelatedQuestions, we need to call it directly
        const result = await generateRelatedQuestions(messages, data.config.model)
        return {
          agentType: data.type,
          model: data.config.model,
          questions: result.object.items,
          output: `Generated ${result.object.items.length} related questions`
        }
      }

      // Execute the agent
      const agentConfig = agentFunction({
        messages,
        model: data.config.model,
        searchMode: data.type === 'researcher' // Enable search for researcher, disable for manual
      })

      // For now, return a simulated result since we can't actually stream here
      // In a real implementation, you'd need to handle streaming differently
      return {
        agentType: data.type,
        model: data.config.model,
        steps: Math.floor(Math.random() * data.config.maxSteps) + 1,
        output: `Agent ${data.type} executed with ${data.config.tools.length} tools configured`,
        temperature: data.config.temperature,
        maxSteps: data.config.maxSteps
      }
    } catch (error) {
      console.error('Agent execution error:', error)
      throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async executeToolNode(node: Node): Promise<any> {
    const data = node.data as any

    try {
      let result: any = null
      const startTime = Date.now()

      // Use the appropriate tool based on type
      switch (data.type) {
        case 'search':
          const searchTool = createSearchTool(data.config.model || 'openai:gpt-4o-mini')
          result = await searchTool.execute({
            query: 'Sample search query', // This would come from node inputs in a real workflow
            max_results: 10,
            search_depth: 'basic'
          }, {
            toolCallId: 'search',
            messages: []
          })
          break

        case 'retrieve':
          result = await retrieveTool.execute({
            url: 'https://example.com' // This would come from node inputs
          }, {
            toolCallId: 'retrieve',
            messages: []
          })
          break

        case 'shopping':
          const shoppingTool = createShoppingTool(data.config.model || 'openai:gpt-4o-mini')
          result = await shoppingTool.execute({
            query: 'Sample shopping query',
            max_results: 5
          }, {
            toolCallId: 'shopping',
            messages: []
          })
          break

        case 'video-search':
          const videoTool = createVideoSearchTool(data.config.model || 'openai:gpt-4o-mini')
          result = await videoTool.execute({
            query: 'Sample video query',
            max_results: 5
          }, {
            toolCallId: 'video-search',
            messages: []
          })
          break

        case 'question':
          // Question tool is for frontend confirmation, so we simulate it
          result = {
            question: 'Would you like to provide more details?',
            options: ['Yes', 'No', 'Maybe'],
            type: 'clarification'
          }
          break

        default:
          result = { message: `Unknown tool type: ${data.type}` }
      }

      const duration = Date.now() - startTime

      return {
        toolType: data.type,
        provider: data.config.provider,
        results: result,
        duration: duration / 1000, // Convert to seconds
        success: true
      }
    } catch (error) {
      console.error('Tool execution error:', error)
      throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async executeDataNode(node: Node): Promise<any> {
    const data = node.data as any
    // Simulate data processing
    return {
      dataType: data.config.dataType,
      processed: true,
      value: data.config.defaultValue || 'processed data'
    }
  }

  private async executeLogicNode(node: Node): Promise<any> {
    const data = node.data as any
    // Simulate logic execution
    return {
      logicType: data.type,
      executed: true,
      result: `Logic ${data.type} processed`
    }
  }

  private async executeUINode(node: Node): Promise<any> {
    const data = node.data as any
    // Simulate UI generation
    return {
      uiType: data.type,
      generated: true,
      content: `UI ${data.type} rendered`
    }
  }
}

export function createWorkflowExecutor(
  nodes: Node[],
  edges: Edge[],
  onNodeUpdate: (nodeId: string, data: any) => void,
  onExecutionComplete: (result: ExecutionResult) => void
): WorkflowExecutor {
  return new WorkflowExecutor(nodes, edges, onNodeUpdate, onExecutionComplete)
}