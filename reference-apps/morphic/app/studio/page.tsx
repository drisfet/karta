'use client'

import { useCallback, useRef, useState } from 'react'

import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'

import { HelpProvider } from '@/lib/help/help-provider'
import { performanceOptimizer } from '@/lib/studio/performance-optimizer'
import { TemplateManager } from '@/lib/studio/template-manager'
import { createClientWorkflowExecutor } from '@/lib/studio/workflow-engine-client'
import { AgentNodeData, ComponentDefinition, DataNodeData, ExecutionResult, LogicNodeData, ToolNodeData, UINodeData, WorkflowTemplate } from '@/lib/types/studio'

import { FloatingHelpPill } from '@/components/help'
import { DataFlowEdge } from '@/components/studio/DataFlowEdge'
import { IntegratedSidebar } from '@/components/studio/IntegratedSidebar'
import { NodePalette } from '@/components/studio/NodePalette'
import { AgentNode, DataNode, LogicNode, ToolNode, UINode } from '@/components/studio/nodes'

import '@xyflow/react/dist/style.css'

const nodeTypes = {
  agentNode: AgentNode,
  toolNode: ToolNode,
  dataNode: DataNode,
  logicNode: LogicNode,
  uiNode: UINode,
}

const edgeTypes = {
  dataFlow: DataFlowEdge,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'agentNode',
    position: { x: 250, y: 100 },
    data: {
      type: 'researcher',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxSteps: 5,
        tools: ['search']
      },
      status: 'idle'
    } as unknown as Record<string, unknown>,
  },
  {
    id: '2',
    type: 'toolNode',
    position: { x: 100, y: 300 },
    data: {
      type: 'search',
      config: {
        provider: 'exa',
        parameters: { query: 'test search' },
        retryCount: 3
      }
    } as unknown as Record<string, unknown>,
  },
  {
    id: '3',
    type: 'dataNode',
    position: { x: 400, y: 300 },
    data: {
      type: 'output',
      config: {
        dataType: 'string',
        defaultValue: 'Search results will appear here',
        validation: { required: false }
      },
      value: null
    } as unknown as Record<string, unknown>,
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'dataFlow',
    data: { isFlowing: false }
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'dataFlow',
    data: { isFlowing: false }
  },
]

export default function AgentStudioPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [activeFlows, setActiveFlows] = useState<Set<string>>(new Set())
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) return

      const type = event.dataTransfer.getData('application/reactflow')
      const nodeData = event.dataTransfer.getData('application/nodedata')

      if (typeof type === 'undefined' || !type) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: nodeData ? JSON.parse(nodeData) : {},
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/nodedata', JSON.stringify(data))
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onNodeUpdate = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    )
  }, [setNodes])

  const handleLoadTemplate = useCallback((template: WorkflowTemplate) => {
    // Reset current workflow
    setNodes(template.nodes)
    setEdges(template.edges)
    setSelectedNode(null)
    setExecutionResult(null)

    // Update template usage count
    TemplateManager.updateWorkflowTemplate(template)
  }, [setNodes, setEdges])

  const handleLoadComponent = useCallback((component: ComponentDefinition) => {
    // For now, just show an alert - in future this could create a new node
    alert(`Component "${component.name}" loaded. Component integration coming soon!`)
  }, [])

  const saveWorkflowTemplate = useCallback((name: string, description: string, category: WorkflowTemplate['category'], tags: string[]) => {
    const template = TemplateManager.saveWorkflowTemplate(
      name,
      description,
      category,
      tags,
      nodes,
      edges
    )
    return template
  }, [nodes, edges])

  const updateDataFlow = useCallback((sourceId: string, targetId: string, flowData: any, isFlowing: boolean = true) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source === sourceId && edge.target === targetId) {
          return {
            ...edge,
            data: {
              ...edge.data,
              isFlowing,
              flowData: isFlowing ? flowData : undefined
            }
          }
        }
        return edge
      })
    )

    // Auto-stop flow after animation
    if (isFlowing) {
      setTimeout(() => {
        setEdges((eds) =>
          eds.map((edge) => {
            if (edge.source === sourceId && edge.target === targetId) {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  isFlowing: false,
                  flowData: undefined
                }
              }
            }
            return edge
          })
        )
      }, 2000) // Stop flow after 2 seconds
    }
  }, [setEdges])

  const handleExecuteWorkflow = useCallback(async () => {
    console.log('🔥 RUN button clicked!')
    if (isExecuting) return

    // Validate workflow before execution
    if (nodes.length === 0) {
      alert('Please add some nodes to your workflow before executing.')
      return
    }

    const hasStartNode = nodes.some(node => node.type === 'agentNode' || node.type === 'dataNode')
    if (!hasStartNode) {
      alert('Please add at least one agent or input data node to start your workflow.')
      return
    }

    performanceOptimizer.startMeasurement('workflow-execution')
    setIsExecuting(true)
    setExecutionResult(null)

    // Reset all node statuses
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, status: 'idle' }
      }))
    )

    // Reset all edge flows
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        data: { ...edge.data, isFlowing: false, flowData: undefined }
      }))
    )

    try {
      const executor = createClientWorkflowExecutor(
        nodes,
        edges,
        onNodeUpdate,
        (result: ExecutionResult) => {
          setExecutionResult(result)
          setIsExecuting(false)
          performanceOptimizer.endMeasurement('workflow-execution')
        },
        updateDataFlow
      )

      await executor.execute()
    } catch (error) {
      console.error('Execution failed:', error)
      setExecutionResult({
        success: false,
        data: {},
        errors: [error instanceof Error ? error.message : 'Unknown execution error'],
        executionTime: performanceOptimizer.endMeasurement('workflow-execution'),
        nodeResults: {}
      })
      setIsExecuting(false)
    }
  }, [nodes, edges, onNodeUpdate, isExecuting, setNodes, setEdges])

  const handleSaveWorkflow = useCallback(() => {
    console.log('💾 SAVE button clicked!')
    const name = prompt('Enter workflow name:')
    if (!name) return

    const description = prompt('Enter workflow description:')
    const category = 'custom' as const
    const tags: string[] = []

    const template = saveWorkflowTemplate(name, description || '', category, tags)
    alert(`Workflow "${name}" saved successfully!`)
  }, [nodes, edges, saveWorkflowTemplate])

  const handleNewWorkflow = useCallback(() => {
    console.log('🆕 NEW button clicked!')
    // Reset all state to blank canvas
    setNodes([])
    setEdges([])
    setSelectedNode(null)
    setExecutionResult(null)
    setIsExecuting(false)

    // Reset React Flow view
    if (reactFlowInstance) {
      reactFlowInstance.fitView()
    }

    console.log('Canvas cleared - ready for new workflow!')
  }, [setNodes, setEdges, reactFlowInstance])

  const handleDebugWorkflow = useCallback(() => {
    console.log('🐛 DEBUG button clicked!')
    alert('Debug mode activated! Use the Execution Monitor to step through your workflow.')
  }, [])

  return (
    <HelpProvider>
      <ReactFlowProvider>
        <div className="h-screen flex flex-col">
        {/* Header Bar */}
        <div className="h-14 border-b bg-background flex items-center px-4 gap-4">
          <h1 className="text-lg font-semibold">Agent Studio</h1>
          {executionResult && (
            <div className="ml-auto text-sm">
              <span className={executionResult.success ? 'text-green-600' : 'text-red-600'}>
                {executionResult.success ? '✓ Success' : '✗ Failed'}
              </span>
              <span className="text-muted-foreground ml-2">
                {executionResult.executionTime}ms
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex relative">
          {/* Node Palette */}
          <NodePalette onDragStart={onDragStart} />

          {/* Canvas */}
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            {/* Floating Toolbar */}
            <div className="absolute top-4 left-4 z-50 flex gap-2 bg-background/90 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
              <button
                onClick={() => {
                  console.log('🆕 NEW button clicked!')
                  handleNewWorkflow()
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors border border-gray-600"
              >
                🆕 New
              </button>
              <button
                onClick={() => {
                  console.log('💾 SAVE button clicked!')
                  handleSaveWorkflow()
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors border border-primary/20"
              >
                💾 Save
              </button>
              <button
                onClick={() => {
                  console.log('▶️ RUN button clicked!')
                  handleExecuteWorkflow()
                }}
                disabled={isExecuting}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors border border-green-600"
              >
                {isExecuting ? '⏳ Running...' : '▶️ Run'}
              </button>
              <button
                onClick={() => {
                  console.log('🐛 DEBUG button clicked!')
                  handleDebugWorkflow()
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors border border-blue-600"
              >
                🐛 Debug
              </button>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              style={{ zIndex: 1 }}
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} />
            </ReactFlow>
          </div>

          {/* Integrated Sidebar */}
          <IntegratedSidebar
            selectedNode={selectedNode}
            nodes={nodes}
            executionResult={executionResult}
            isExecuting={isExecuting}
            onNodeUpdate={onNodeUpdate}
            onDebugStep={(nodeId: string) => {
              // Find and highlight the node being stepped into
              const nodeToSelect = nodes.find(node => node.id === nodeId)
              if (nodeToSelect) {
                setSelectedNode(nodeToSelect)
              }
              alert(`Stepping into node: ${nodeId}`)
            }}
            onStopExecution={() => setIsExecuting(false)}
            onResetWorkflow={() => {
              setNodes(initialNodes)
              setEdges(initialEdges)
              setExecutionResult(null)
              setSelectedNode(null)
            }}
            onLoadTemplate={handleLoadTemplate}
            onLoadComponent={handleLoadComponent}
            onSaveWorkflow={saveWorkflowTemplate}
          />

          {/* Floating Help Pill */}
          <FloatingHelpPill />
        </div>
      </div>
      </ReactFlowProvider>
    </HelpProvider>
  )
}