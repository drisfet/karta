import React from 'react'

import { Handle, NodeProps,Position } from '@xyflow/react'
import { Bell, Monitor, PanelTop } from 'lucide-react'

import { UINodeData } from '@/lib/types/studio'

export function UINode({ data }: NodeProps) {
  const nodeData = data as unknown as UINodeData

  const getUIIcon = () => {
    switch (nodeData.type) {
      case 'panel-generator':
        return <PanelTop className="w-4 h-4 text-pink-600" />
      case 'notification':
        return <Bell className="w-4 h-4 text-pink-600" />
      default:
        return <Monitor className="w-4 h-4 text-pink-600" />
    }
  }

  const getUIName = () => {
    switch (nodeData.type) {
      case 'panel-generator':
        return 'Panel Generator'
      case 'notification':
        return 'Notification'
      default:
        return 'UI Node'
    }
  }

  return (
    <div className="px-4 py-3 shadow-md rounded-lg border-2 border-pink-300 bg-pink-50 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-pink-500"
      />

      <div className="flex items-center gap-2 mb-2">
        {getUIIcon()}
        <div className="font-medium text-sm">
          {getUIName()}
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        {nodeData.type === 'panel-generator' && nodeData.config.panelType && (
          <div>Panel Type: {nodeData.config.panelType}</div>
        )}
        {nodeData.type === 'notification' && nodeData.config.notificationType && (
          <div>Notification: {nodeData.config.notificationType}</div>
        )}
        {nodeData.config.template && (
          <div>Template: {nodeData.config.template.slice(0, 20)}...</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-pink-500"
      />
    </div>
  )
}