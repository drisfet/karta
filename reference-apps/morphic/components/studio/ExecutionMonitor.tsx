'use client'

import React, { useEffect,useState } from 'react'

import { Node } from '@xyflow/react'
import {
  AlertTriangle,
  BarChart3,
  Bug,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  Square,
  XCircle,
  Zap} from 'lucide-react'

import { ExecutionResult, WorkflowMetrics } from '@/lib/types/studio'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ArtifactContent } from '@/components/artifact/artifact-content'
import { useArtifact } from '@/components/artifact/artifact-context'

interface ExecutionMonitorProps {
  nodes: Node[]
  executionResult: ExecutionResult | null
  isExecuting: boolean
  onDebugStep?: (nodeId: string) => void
  onStopExecution?: () => void
  onResetWorkflow?: () => void
}

interface ExecutionStep {
  id: string
  nodeId: string
  nodeName: string
  status: 'pending' | 'running' | 'completed' | 'error'
  startTime: number
  endTime?: number
  duration?: number
  data?: any
  error?: string
}

export function ExecutionMonitor({
  nodes,
  executionResult,
  isExecuting,
  onDebugStep,
  onStopExecution,
  onResetWorkflow
}: ExecutionMonitorProps) {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [selectedStep, setSelectedStep] = useState<ExecutionStep | null>(null)
  const [showArtifacts, setShowArtifacts] = useState(true)
  const { open: openArtifact } = useArtifact()

  // Mock execution steps for demonstration
  useEffect(() => {
    if (isExecuting && executionSteps.length === 0) {
      const steps: ExecutionStep[] = nodes.map((node, index) => ({
        id: `step-${index}`,
        nodeId: node.id,
        nodeName: getNodeDisplayName(node),
        status: index === 0 ? 'running' : 'pending',
        startTime: Date.now() + (index * 1000),
        data: { message: `Processing ${getNodeDisplayName(node)}` }
      }))
      setExecutionSteps(steps)
    }
  }, [isExecuting, nodes, executionSteps.length])

  const getNodeDisplayName = (node: Node): string => {
    const data = node.data as any
    switch (node.type) {
      case 'agentNode':
        return data.type === 'researcher' ? 'Researcher Agent' : 'Manual Researcher'
      case 'toolNode':
        return `${data.type} Tool`
      case 'dataNode':
        return `${data.type} Data`
      case 'logicNode':
        return data.type
      case 'uiNode':
        return 'UI Panel'
      default:
        return 'Unknown Node'
    }
  }

  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 border-blue-200'
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const handleStepClick = (step: ExecutionStep) => {
    setSelectedStep(step)
    if (step.data && showArtifacts) {
      // Create a mock artifact for demonstration
      const mockPart = {
        type: 'reasoning' as const,
        reasoning: step.data.message || 'Execution step details'
      }
      openArtifact(mockPart)
    }
  }

  const calculateMetrics = (): WorkflowMetrics => {
    if (!executionResult) {
      return {
        totalExecutionTime: 0,
        nodeExecutionTimes: {},
        dataTransferSizes: {},
        errorRates: {},
        bottleneckAnalysis: []
      }
    }

    return {
      totalExecutionTime: executionResult.executionTime,
      nodeExecutionTimes: executionSteps.reduce((acc, step) => {
        if (step.duration) {
          acc[step.nodeId] = step.duration
        }
        return acc
      }, {} as Record<string, number>),
      dataTransferSizes: {},
      errorRates: {},
      bottleneckAnalysis: []
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="w-80 bg-background border-l p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Execution Monitor</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowArtifacts(!showArtifacts)}
          >
            {showArtifacts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onResetWorkflow}
            disabled={isExecuting}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="execution" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="execution" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isExecuting ? 'Executing...' : 'Ready'}
            </span>
            {executionResult && (
              <Badge variant={executionResult.success ? 'default' : 'destructive'}>
                {executionResult.success ? 'Success' : 'Failed'}
              </Badge>
            )}
          </div>

          <div className="h-64 overflow-y-auto">
            <div className="space-y-2">
              {executionSteps.map((step, index) => (
                <Card
                  key={step.id}
                  className={`cursor-pointer transition-colors ${getStatusColor(step.status)} ${
                    selectedStep?.id === step.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleStepClick(step)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(step.status)}
                      <span className="text-sm font-medium">{step.nodeName}</span>
                      <Badge variant="outline" className="text-xs">
                        {step.status}
                      </Badge>
                    </div>
                    {step.duration && (
                      <div className="text-xs text-muted-foreground">
                        Duration: {step.duration}ms
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {executionResult && (
            <div className="text-xs text-muted-foreground">
              Total execution time: {executionResult.executionTime}ms
            </div>
          )}
        </TabsContent>

        <TabsContent value="debug" className="space-y-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!isExecuting}
              onClick={() => {
                console.log('▶️ STEP INTO button clicked!')
                if (onDebugStep) {
                  // Find the first running or pending step
                  const nextStep = executionSteps.find(step =>
                    step.status === 'running' || step.status === 'pending'
                  )
                  if (nextStep) {
                    onDebugStep(nextStep.nodeId)
                  }
                }
              }}
            >
              <Play className="w-4 h-4 mr-1" />
              Step Into
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!isExecuting}
              onClick={() => {
                console.log('⏸️ PAUSE button clicked!')
                alert('Pause functionality would pause execution at current step')
              }}
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('⏹️ STOP button clicked!')
                if (onStopExecution) onStopExecution()
              }}
              disabled={!isExecuting}
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Breakpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nodes.map((node) => (
                  <div key={node.id} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{getNodeDisplayName(node)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedStep && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Step Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div><strong>Node:</strong> {selectedStep.nodeName}</div>
                  <div><strong>Status:</strong> {selectedStep.status}</div>
                  {selectedStep.duration && (
                    <div><strong>Duration:</strong> {selectedStep.duration}ms</div>
                  )}
                  {selectedStep.data && (
                    <div><strong>Data:</strong> {JSON.stringify(selectedStep.data, null, 2)}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Execution Time</span>
                  <span>{metrics.totalExecutionTime}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((metrics.totalExecutionTime / 10000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Node Execution Times</h4>
                <div className="space-y-1">
                  {Object.entries(metrics.nodeExecutionTimes).map(([nodeId, time]) => (
                    <div key={nodeId} className="flex justify-between text-xs">
                      <span>{nodeId}</span>
                      <span>{time}ms</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Success Rate</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-xs">85%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}