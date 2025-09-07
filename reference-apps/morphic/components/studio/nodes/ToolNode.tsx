import React from 'react'

import { Handle, NodeProps,Position } from '@xyflow/react'
import { Package, Search, Video,Wrench } from 'lucide-react'

import { ToolNodeData } from '@/lib/types/studio'

export function ToolNode({ data }: NodeProps) {
  const nodeData = data as unknown as ToolNodeData

  const getToolIcon = () => {
    switch (nodeData.type) {
      case 'search':
        return <Search className="w-4 h-4 text-green-600" />
      case 'retrieve':
        return <Package className="w-4 h-4 text-blue-600" />
      case 'shopping':
        return <Package className="w-4 h-4 text-purple-600" />
      case 'video-search':
        return <Video className="w-4 h-4 text-red-600" />
      case 'question':
        return <Wrench className="w-4 h-4 text-orange-600" />
      default:
        return <Wrench className="w-4 h-4 text-gray-600" />
    }
  }

  const getToolName = () => {
    switch (nodeData.type) {
      case 'search':
        return 'Search Tool'
      case 'retrieve':
        return 'Retrieve Tool'
      case 'shopping':
        return 'Shopping Tool'
      case 'video-search':
        return 'Video Search'
      case 'question':
        return 'Question Tool'
      default:
        return 'Tool'
    }
  }

  return (
    <div className="px-4 py-3 shadow-md rounded-lg border-2 border-green-300 bg-green-50 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500"
      />

      <div className="flex items-center gap-2 mb-2">
        {getToolIcon()}
        <div className="font-medium text-sm">
          {getToolName()}
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div>Provider: {nodeData.config.provider}</div>
        <div>Retry: {nodeData.config.retryCount}</div>
        {nodeData.executionStats ? (
          <div className="text-xs text-gray-500">
            Runs: {nodeData.executionStats.runCount} |
            {nodeData.executionStats.avgDuration.toFixed(1)}ms avg |
            {nodeData.executionStats.successRate.toFixed(1)}% success
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Runs: 0 | 0.0ms avg | 0.0% success
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500"
      />
    </div>
  )
}