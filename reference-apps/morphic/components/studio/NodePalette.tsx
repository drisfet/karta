'use client'

import React from 'react'

import { Bot, Database, GitBranch, Monitor,Wrench } from 'lucide-react'

interface NodeTemplate {
  type: string
  label: string
  icon: React.ReactNode
  color: string
  data: any
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'agentNode',
    label: 'Researcher Agent',
    icon: <Bot className="w-5 h-5" />,
    color: 'bg-blue-500',
    data: {
      type: 'researcher',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxSteps: 10,
        tools: []
      },
      status: 'idle'
    }
  },
  {
    type: 'agentNode',
    label: 'Manual Researcher',
    icon: <Bot className="w-5 h-5" />,
    color: 'bg-blue-500',
    data: {
      type: 'manual-researcher',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxSteps: 5,
        tools: []
      },
      status: 'idle'
    }
  },
  {
    type: 'agentNode',
    label: 'Related Questions',
    icon: <Bot className="w-5 h-5" />,
    color: 'bg-blue-500',
    data: {
      type: 'generate-related-questions',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxSteps: 3,
        tools: []
      },
      status: 'idle'
    }
  },
  {
    type: 'toolNode',
    label: 'Search Tool',
    icon: <Wrench className="w-5 h-5" />,
    color: 'bg-green-500',
    data: {
      type: 'search',
      config: {
        provider: 'exa',
        parameters: {},
        retryCount: 3
      },
      executionStats: {
        runCount: 0,
        avgDuration: 0,
        successRate: 0
      }
    }
  },
  {
    type: 'toolNode',
    label: 'Retrieve Tool',
    icon: <Wrench className="w-5 h-5" />,
    color: 'bg-green-500',
    data: {
      type: 'retrieve',
      config: {
        provider: 'default',
        parameters: {},
        retryCount: 3
      },
      executionStats: {
        runCount: 0,
        avgDuration: 0,
        successRate: 0
      }
    }
  },
  {
    type: 'toolNode',
    label: 'Shopping Tool',
    icon: <Wrench className="w-5 h-5" />,
    color: 'bg-green-500',
    data: {
      type: 'shopping',
      config: {
        provider: 'default',
        parameters: {},
        retryCount: 3
      },
      executionStats: {
        runCount: 0,
        avgDuration: 0,
        successRate: 0
      }
    }
  },
  {
    type: 'toolNode',
    label: 'Video Search',
    icon: <Wrench className="w-5 h-5" />,
    color: 'bg-green-500',
    data: {
      type: 'video-search',
      config: {
        provider: 'default',
        parameters: {},
        retryCount: 3
      },
      executionStats: {
        runCount: 0,
        avgDuration: 0,
        successRate: 0
      }
    }
  },
  {
    type: 'toolNode',
    label: 'Question Tool',
    icon: <Wrench className="w-5 h-5" />,
    color: 'bg-green-500',
    data: {
      type: 'question',
      config: {
        provider: 'default',
        parameters: {},
        retryCount: 1
      },
      executionStats: {
        runCount: 0,
        avgDuration: 0,
        successRate: 0
      }
    }
  },
  {
    type: 'dataNode',
    label: 'Input Data',
    icon: <Database className="w-5 h-5" />,
    color: 'bg-orange-500',
    data: {
      type: 'input',
      config: {
        dataType: 'string',
        validation: { required: false }
      }
    }
  },
  {
    type: 'dataNode',
    label: 'Output Data',
    icon: <Database className="w-5 h-5" />,
    color: 'bg-orange-500',
    data: {
      type: 'output',
      config: {
        dataType: 'string',
        validation: { required: false }
      }
    }
  },
  {
    type: 'logicNode',
    label: 'Condition',
    icon: <GitBranch className="w-5 h-5" />,
    color: 'bg-purple-500',
    data: {
      type: 'condition',
      config: {
        condition: ''
      }
    }
  },
  {
    type: 'uiNode',
    label: 'Panel Generator',
    icon: <Monitor className="w-5 h-5" />,
    color: 'bg-pink-500',
    data: {
      type: 'panel-generator',
      config: {
        panelType: 'default'
      }
    }
  }
]

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="w-64 bg-background border-r p-4 overflow-y-auto">
      <h3 className="text-sm font-medium mb-4">Node Palette</h3>

      <div className="space-y-2">
        {nodeTemplates.map((template, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => onDragStart(e, template.type, template.data)}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
          >
            <div className={`p-2 rounded ${template.color} text-white`}>
              {template.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{template.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}