import React from 'react'

import { Handle, NodeProps,Position } from '@xyflow/react'
import { AlertCircle,Bot, Play, Square } from 'lucide-react'

import { AgentNodeData } from '@/lib/types/studio'

export function AgentNode({ data }: NodeProps) {
  const nodeData = data as unknown as AgentNodeData
  const getStatusIcon = () => {
    switch (nodeData.status) {
      case 'running':
        return <Play className="w-4 h-4 text-green-500" />
      case 'completed':
        return <Square className="w-4 h-4 text-blue-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Bot className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (nodeData.status) {
      case 'running':
        return 'border-green-500 bg-green-50'
      case 'completed':
        return 'border-blue-500 bg-blue-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg border-2 min-w-[200px] ${getStatusColor()}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />

      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <div className="font-medium text-sm">
          {nodeData.type === 'researcher' ? 'Researcher Agent' :
           nodeData.type === 'manual-researcher' ? 'Manual Researcher' :
           'Related Questions Agent'}
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div>Model: {nodeData.config.model}</div>
        <div>Temp: {nodeData.config.temperature}</div>
        <div>Tools: {nodeData.config.tools.length}</div>
        {nodeData.executionStats && (
          <div className="text-xs text-gray-500">
            Runs: {nodeData.executionStats.runCount} | {nodeData.executionStats.successRate.toFixed(1)}% success
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  )
}