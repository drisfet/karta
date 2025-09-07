import React from 'react'

import { Handle, NodeProps,Position } from '@xyflow/react'
import { ArrowRight, Database, FileInput,Variable } from 'lucide-react'

import { DataNodeData } from '@/lib/types/studio'

export function DataNode({ data }: NodeProps) {
  const nodeData = data as unknown as DataNodeData

  const getDataIcon = () => {
    switch (nodeData.type) {
      case 'input':
        return <FileInput className="w-4 h-4 text-orange-600" />
      case 'output':
        return <ArrowRight className="w-4 h-4 text-orange-600" />
      case 'variable':
        return <Variable className="w-4 h-4 text-orange-600" />
      default:
        return <Database className="w-4 h-4 text-orange-600" />
    }
  }

  const getDataName = () => {
    switch (nodeData.type) {
      case 'input':
        return 'Input Data'
      case 'output':
        return 'Output Data'
      case 'variable':
        return 'Variable'
      default:
        return 'Data Node'
    }
  }

  return (
    <div className="px-4 py-3 shadow-md rounded-lg border-2 border-orange-300 bg-orange-50 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500"
      />

      <div className="flex items-center gap-2 mb-2">
        {getDataIcon()}
        <div className="font-medium text-sm">
          {getDataName()}
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div>Type: {nodeData.config.dataType}</div>
        {nodeData.config.defaultValue && (
          <div>Default: {String(nodeData.config.defaultValue).slice(0, 20)}...</div>
        )}
        {nodeData.value && (
          <div className="text-xs text-gray-500">
            Value: {String(nodeData.value).slice(0, 20)}...
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500"
      />
    </div>
  )
}