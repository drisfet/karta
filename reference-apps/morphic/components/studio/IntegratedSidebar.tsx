'use client'

import { useState } from 'react'

import { Node } from '@xyflow/react'
import { Activity, ChevronLeft, ChevronRight,Library, Settings } from 'lucide-react'

import { ExecutionResult } from '@/lib/types/studio'
import { ComponentDefinition, WorkflowTemplate } from '@/lib/types/studio'
import { cn } from '@/lib/utils'

import { ExecutionMonitor } from './ExecutionMonitor'
import { PropertyPanel } from './PropertyPanel'
import { TemplateLibrary } from './TemplateLibrary'

interface IntegratedSidebarProps {
  selectedNode: Node | null
  nodes: Node[]
  executionResult: ExecutionResult | null
  isExecuting: boolean
  onNodeUpdate: (nodeId: string, data: any) => void
  onDebugStep: (nodeId: string) => void
  onStopExecution: () => void
  onResetWorkflow: () => void
  onLoadTemplate: (template: WorkflowTemplate) => void
  onLoadComponent: (component: ComponentDefinition) => void
  onSaveWorkflow: (name: string, description: string, category: WorkflowTemplate['category'], tags: string[]) => WorkflowTemplate
  className?: string
}

type TabType = 'properties' | 'execution' | 'templates'

interface TabConfig {
  id: TabType
  label: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType<any>
  props: any
}

export function IntegratedSidebar({
  selectedNode,
  nodes,
  executionResult,
  isExecuting,
  onNodeUpdate,
  onDebugStep,
  onStopExecution,
  onResetWorkflow,
  onLoadTemplate,
  onLoadComponent,
  onSaveWorkflow,
  className
}: IntegratedSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('properties')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const tabs: TabConfig[] = [
    {
      id: 'properties',
      label: 'Properties',
      icon: Settings,
      component: PropertyPanel,
      props: {
        selectedNode,
        onNodeUpdate
      }
    },
    {
      id: 'execution',
      label: 'Execution',
      icon: Activity,
      component: ExecutionMonitor,
      props: {
        nodes,
        executionResult,
        isExecuting,
        onDebugStep,
        onStopExecution,
        onResetWorkflow
      }
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: Library,
      component: TemplateLibrary,
      props: {
        onLoadTemplate,
        onLoadComponent,
        onSaveWorkflow
      }
    }
  ]

  const activeTabConfig = tabs.find(tab => tab.id === activeTab)
  const ActiveComponent = activeTabConfig?.component

  return (
    <div className={cn(
      "relative border-l bg-background transition-all duration-300 ease-in-out",
      isCollapsed ? "w-12" : "w-72 sm:w-80",
      className
    )}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent transition-colors"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {isCollapsed ? (
        /* Collapsed State - Just Tab Icons */
        <div className="flex h-full flex-col items-center py-2 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsCollapsed(false)
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent",
                  activeTab === tab.id && "bg-accent text-accent-foreground"
                )}
                title={tab.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      ) : (
        /* Expanded State - Full Interface */
        <div className="flex h-full flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-1 sm:px-2 py-3 text-xs font-medium transition-colors hover:bg-accent min-w-0 overflow-hidden",
                    activeTab === tab.id
                      ? "border-b-2 border-primary bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title={tab.label}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate hidden sm:inline-block max-w-full text-xs">
                    {tab.label}
                  </span>
                  {/* Mobile: Show first letter only */}
                  <span className="sm:hidden text-xs font-bold leading-none">
                    {tab.label.charAt(0)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {ActiveComponent && (
              <div className="h-full">
                <ActiveComponent {...activeTabConfig.props} />
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="border-t px-2 py-2 min-w-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground min-w-0">
              <span className="truncate flex-1 min-w-0" title={activeTabConfig?.label}>
                {activeTabConfig?.label}
              </span>
              {isExecuting && (
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 flex-shrink-0"></div>
                  <span className="hidden sm:inline truncate">Running</span>
                  <span className="sm:hidden">●</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}