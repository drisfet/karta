'use client'

import React, { useEffect, useState } from 'react'

import { Node } from '@xyflow/react'

import { AgentNodeData, DataNodeData, LogicNodeData, ToolNodeData, UINodeData } from '@/lib/types/studio'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface PropertyPanelProps {
  selectedNode: Node | null
  onNodeUpdate: (nodeId: string, data: any) => void
}

export function PropertyPanel({ selectedNode, onNodeUpdate }: PropertyPanelProps) {
  const [localNodeData, setLocalNodeData] = useState<any>(null)

  // Update local state when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setLocalNodeData(selectedNode.data)
    } else {
      setLocalNodeData(null)
    }
  }, [selectedNode])

  // Update local state when node data changes externally
  useEffect(() => {
    if (selectedNode && selectedNode.data !== localNodeData) {
      setLocalNodeData(selectedNode.data)
    }
  }, [selectedNode?.data, localNodeData])
  if (!selectedNode) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-4">Properties</h3>
        <div className="text-sm text-muted-foreground">
          Select a node to view its properties
        </div>
      </div>
    )
  }

  const handleDataUpdate = (key: string, value: any) => {
    if (!selectedNode) return
    const updatedData = { ...localNodeData, [key]: value }
    setLocalNodeData(updatedData)
    onNodeUpdate(selectedNode.id, updatedData)
  }

  const handleNestedUpdate = (parentKey: string, key: string, value: any) => {
    if (!selectedNode) return
    const updatedData = {
      ...localNodeData,
      [parentKey]: {
        ...localNodeData[parentKey],
        [key]: value
      }
    }
    setLocalNodeData(updatedData)
    onNodeUpdate(selectedNode.id, updatedData)
  }

  const renderAgentProperties = (data: AgentNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="agent-type">Agent Type</Label>
        <Select
          value={data.type}
          onValueChange={(value) => handleDataUpdate('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="researcher">Researcher</SelectItem>
            <SelectItem value="manual-researcher">Manual Researcher</SelectItem>
            <SelectItem value="generate-related-questions">Related Questions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="model">Model</Label>
        <Select
          value={data.config.model}
          onValueChange={(value) => handleNestedUpdate('config', 'model', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3">Claude 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="temperature">Temperature: {data.config.temperature}</Label>
        <Slider
          value={[data.config.temperature]}
          onValueChange={([value]) => handleNestedUpdate('config', 'temperature', value)}
          max={2}
          min={0}
          step={0.1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="max-steps">Max Steps</Label>
        <Input
          id="max-steps"
          type="number"
          value={data.config.maxSteps || 5}
          onChange={(e) => handleNestedUpdate('config', 'maxSteps', parseInt(e.target.value) || 5)}
        />
      </div>

      <div>
        <Label>Status</Label>
        <div className="text-sm text-muted-foreground mt-1">
          {data.status}
        </div>
      </div>
    </div>
  )

  const renderToolProperties = (data: ToolNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tool-type">Tool Type</Label>
        <Select
          value={data.type}
          onValueChange={(value) => handleDataUpdate('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="search">Search</SelectItem>
            <SelectItem value="retrieve">Retrieve</SelectItem>
            <SelectItem value="shopping">Shopping</SelectItem>
            <SelectItem value="video-search">Video Search</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="provider">Provider</Label>
        <Select
          value={data.config.provider}
          onValueChange={(value) => handleNestedUpdate('config', 'provider', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="exa">Exa Search</SelectItem>
            <SelectItem value="serpapi">SerpAPI</SelectItem>
            <SelectItem value="google">Google Search</SelectItem>
            <SelectItem value="bing">Bing Search</SelectItem>
            <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
            <SelectItem value="custom">Custom Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="retry-count">Retry Count</Label>
        <Input
          id="retry-count"
          type="number"
          value={data.config.retryCount || 3}
          onChange={(e) => handleNestedUpdate('config', 'retryCount', parseInt(e.target.value) || 3)}
        />
      </div>

      {data.executionStats && (
        <div>
          <Label>Execution Stats</Label>
          <div className="text-sm text-muted-foreground mt-1 space-y-1">
            <div>Runs: {data.executionStats.runCount || 0}</div>
            <div>Avg Duration: {(data.executionStats.avgDuration || 0).toFixed(2)}s</div>
            <div>Success Rate: {(data.executionStats.successRate || 0).toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  )

  const renderDataProperties = (data: DataNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="data-type">Data Type</Label>
        <Select
          value={data.type}
          onValueChange={(value) => handleDataUpdate('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="input">Input</SelectItem>
            <SelectItem value="output">Output</SelectItem>
            <SelectItem value="variable">Variable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="data-type-config">Data Type</Label>
        <Select
          value={data.config.dataType}
          onValueChange={(value) => handleNestedUpdate('config', 'dataType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="object">Object</SelectItem>
            <SelectItem value="array">Array</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="default-value">Default Value</Label>
        <Input
          id="default-value"
          value={data.config.defaultValue || ''}
          onChange={(e) => handleNestedUpdate('config', 'defaultValue', e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={data.config.validation?.required || false}
          onCheckedChange={(checked) => handleNestedUpdate('config', 'validation', { ...data.config.validation, required: checked })}
        />
        <Label htmlFor="required">Required</Label>
      </div>
    </div>
  )

  const renderLogicProperties = (data: LogicNodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="logic-type">Logic Type</Label>
        <Select
          value={data.type}
          onValueChange={(value) => handleDataUpdate('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="condition">Condition</SelectItem>
            <SelectItem value="loop">Loop</SelectItem>
            <SelectItem value="transformer">Transformer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.type === 'condition' && (
        <div>
          <Label htmlFor="condition">Condition</Label>
          <Textarea
            id="condition"
            value={data.config.condition || ''}
            onChange={(e) => handleNestedUpdate('config', 'condition', e.target.value)}
            placeholder="Enter condition logic..."
          />
        </div>
      )}

      {data.type === 'loop' && (
        <div>
          <Label htmlFor="loop-count">Loop Count</Label>
          <Input
            id="loop-count"
            type="number"
            value={data.config.loopCount || 1}
            onChange={(e) => handleNestedUpdate('config', 'loopCount', parseInt(e.target.value))}
          />
        </div>
      )}

      {data.type === 'transformer' && (
        <div>
          <Label htmlFor="transform-function">Transform Function</Label>
          <Textarea
            id="transform-function"
            value={data.config.transformFunction || ''}
            onChange={(e) => handleNestedUpdate('config', 'transformFunction', e.target.value)}
            placeholder="Enter transform logic..."
          />
        </div>
      )}
    </div>
  )

  const renderUIProperties = (data: UINodeData) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ui-type">UI Type</Label>
        <Select
          value={data.type}
          onValueChange={(value) => handleDataUpdate('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="panel-generator">Panel Generator</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.type === 'panel-generator' && (
        <div>
          <Label htmlFor="panel-type">Panel Type</Label>
          <Select
            value={data.config.panelType || ''}
            onValueChange={(value) => handleNestedUpdate('config', 'panelType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select panel type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHAT_PANEL">Chat Panel</SelectItem>
              <SelectItem value="SHOPPING_PANEL">Shopping Panel</SelectItem>
              <SelectItem value="PRIME_PANEL">Prime Panel</SelectItem>
              <SelectItem value="SEARCH_RESULTS">Search Results</SelectItem>
              <SelectItem value="DATA_VISUALIZATION">Data Visualization</SelectItem>
              <SelectItem value="CUSTOM">Custom Panel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {data.type === 'notification' && (
        <div>
          <Label htmlFor="notification-type">Notification Type</Label>
          <Input
            id="notification-type"
            value={data.config.notificationType || ''}
            onChange={(e) => handleNestedUpdate('config', 'notificationType', e.target.value)}
          />
        </div>
      )}

      <div>
        <Label htmlFor="template">Template</Label>
        <Textarea
          id="template"
          value={data.config.template || ''}
          onChange={(e) => handleNestedUpdate('config', 'template', e.target.value)}
          placeholder="Enter template..."
        />
      </div>
    </div>
  )

  const renderNodeProperties = () => {
    if (!localNodeData || !selectedNode) {
      return <div className="text-sm text-muted-foreground">No data available</div>
    }

    switch (selectedNode.type) {
      case 'agentNode':
        return renderAgentProperties(localNodeData)
      case 'toolNode':
        return renderToolProperties(localNodeData)
      case 'dataNode':
        return renderDataProperties(localNodeData)
      case 'logicNode':
        return renderLogicProperties(localNodeData)
      case 'uiNode':
        return renderUIProperties(localNodeData)
      default:
        return <div className="text-sm text-muted-foreground">Unknown node type</div>
    }
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Node Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {renderNodeProperties()}
        </CardContent>
      </Card>
    </div>
  )
}