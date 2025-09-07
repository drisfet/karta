import React from 'react'

import { Handle, NodeProps,Position } from '@xyflow/react'
import { Code, GitBranch, RotateCcw, Zap } from 'lucide-react'

import { LogicNodeData } from '@/lib/types/studio'

export function LogicNode({ data }: NodeProps) {
  const nodeData = data as unknown as LogicNodeData

  const getLogicIcon = () => {
    switch (nodeData.type) {
      case 'condition':
        return <GitBranch className="w-4 h-4 text-purple-600" />
      case 'loop':
        return <RotateCcw className="w-4 h-4 text-purple-600" />
      case 'transformer':
        return <Code className="w-4 h-4 text-purple-600" />
      default:
        return <Zap className="w-4 h-4 text-purple-600" />
    }
  }

  const getLogicName = () => {
    switch (nodeData.type) {
      case 'condition':
        return 'Condition'
      case 'loop':
        return 'Loop'
      case 'transformer':
        return 'Transformer'
      default:
        return 'Logic Node'
    }
  }

  return (
    <div className="px-4 py-3 shadow-md rounded-lg border-2 border-purple-300 bg-purple-50 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500"
      />

      <div className="flex items-center gap-2 mb-2">
        {getLogicIcon()}
        <div className="font-medium text-sm">
          {getLogicName()}
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        {nodeData.type === 'condition' && nodeData.config.condition && (
          <div>Condition: {nodeData.config.condition.slice(0, 20)}...</div>
        )}
        {nodeData.type === 'loop' && nodeData.config.loopCount && (
          <div>Loop Count: {nodeData.config.loopCount}</div>
        )}
        {nodeData.type === 'transformer' && nodeData.config.transformFunction && (
          <div>Function: {nodeData.config.transformFunction.slice(0, 20)}...</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-purple-500"
      />
    </div>
  )
}