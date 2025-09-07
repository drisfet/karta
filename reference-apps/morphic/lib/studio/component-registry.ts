import { ComponentDefinition,WorkflowTemplate } from '@/lib/types/studio'

import { TemplateManager } from './template-manager'

// Component Registry for Main Application Integration
export class ComponentRegistry {
  private static instance: ComponentRegistry
  private workflows: Map<string, WorkflowTemplate> = new Map()
  private components: Map<string, ComponentDefinition> = new Map()
  private listeners: Set<(type: 'workflow' | 'component', action: 'add' | 'update' | 'delete', id: string) => void> = new Set()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry()
    }
    return ComponentRegistry.instance
  }

  // Load all saved templates and components from storage
  private loadFromStorage(): void {
    const workflows = TemplateManager.getWorkflowTemplates()
    const components = TemplateManager.getComponentDefinitions()

    workflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow)
    })

    components.forEach(component => {
      this.components.set(component.id, component)
    })
  }

  // Workflow Management
  registerWorkflow(workflow: WorkflowTemplate): void {
    this.workflows.set(workflow.id, workflow)
    this.notifyListeners('workflow', 'add', workflow.id)
  }

  getWorkflow(workflowId: string): WorkflowTemplate | undefined {
    return this.workflows.get(workflowId)
  }

  getAllWorkflows(): WorkflowTemplate[] {
    return Array.from(this.workflows.values())
  }

  getWorkflowsByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
    return this.getAllWorkflows().filter(workflow => workflow.category === category)
  }

  updateWorkflow(workflowId: string, updates: Partial<WorkflowTemplate>): void {
    const workflow = this.workflows.get(workflowId)
    if (workflow) {
      const updatedWorkflow = { ...workflow, ...updates, metadata: { ...workflow.metadata, updatedAt: new Date() } }
      this.workflows.set(workflowId, updatedWorkflow)
      this.notifyListeners('workflow', 'update', workflowId)
    }
  }

  unregisterWorkflow(workflowId: string): void {
    if (this.workflows.delete(workflowId)) {
      this.notifyListeners('workflow', 'delete', workflowId)
    }
  }

  // Component Management
  registerComponent(component: ComponentDefinition): void {
    this.components.set(component.id, component)
    this.notifyListeners('component', 'add', component.id)
  }

  getComponent(componentId: string): ComponentDefinition | undefined {
    return this.components.get(componentId)
  }

  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values())
  }

  getComponentsByType(type: ComponentDefinition['type']): ComponentDefinition[] {
    return this.getAllComponents().filter(component => component.type === type)
  }

  updateComponent(componentId: string, updates: Partial<ComponentDefinition>): void {
    const component = this.components.get(componentId)
    if (component) {
      const updatedComponent = { ...component, ...updates, metadata: { ...component.metadata, updatedAt: new Date() } }
      this.components.set(componentId, updatedComponent)
      this.notifyListeners('component', 'update', componentId)
    }
  }

  unregisterComponent(componentId: string): void {
    if (this.components.delete(componentId)) {
      this.notifyListeners('component', 'delete', componentId)
    }
  }

  // Listener Management
  addListener(listener: (type: 'workflow' | 'component', action: 'add' | 'update' | 'delete', id: string) => void): void {
    this.listeners.add(listener)
  }

  removeListener(listener: (type: 'workflow' | 'component', action: 'add' | 'update' | 'delete', id: string) => void): void {
    this.listeners.delete(listener)
  }

  private notifyListeners(type: 'workflow' | 'component', action: 'add' | 'update' | 'delete', id: string): void {
    this.listeners.forEach(listener => {
      try {
        listener(type, action, id)
      } catch (error) {
        console.error('Error in component registry listener:', error)
      }
    })
  }

  // Utility Methods
  searchWorkflows(query: string): WorkflowTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllWorkflows().filter(workflow =>
      workflow.name.toLowerCase().includes(lowerQuery) ||
      workflow.description.toLowerCase().includes(lowerQuery) ||
      workflow.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  searchComponents(query: string): ComponentDefinition[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllComponents().filter(component =>
      component.name.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.category.toLowerCase().includes(lowerQuery)
    )
  }

  // Export/Import for sharing
  exportWorkflow(workflowId: string): string | null {
    const workflow = this.getWorkflow(workflowId)
    return workflow ? JSON.stringify(workflow, null, 2) : null
  }

  exportComponent(componentId: string): string | null {
    const component = this.getComponent(componentId)
    return component ? JSON.stringify(component, null, 2) : null
  }

  importWorkflow(workflowJson: string): WorkflowTemplate | null {
    try {
      const workflow = JSON.parse(workflowJson) as WorkflowTemplate
      this.registerWorkflow(workflow)
      return workflow
    } catch (error) {
      console.error('Error importing workflow:', error)
      return null
    }
  }

  importComponent(componentJson: string): ComponentDefinition | null {
    try {
      const component = JSON.parse(componentJson) as ComponentDefinition
      this.registerComponent(component)
      return component
    } catch (error) {
      console.error('Error importing component:', error)
      return null
    }
  }

  // Statistics
  getStats() {
    return {
      workflows: {
        total: this.workflows.size,
        byCategory: this.getAllWorkflows().reduce((acc, workflow) => {
          acc[workflow.category] = (acc[workflow.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      components: {
        total: this.components.size,
        byType: this.getAllComponents().reduce((acc, component) => {
          acc[component.type] = (acc[component.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }
  }

  // Clear all data
  clear(): void {
    this.workflows.clear()
    this.components.clear()
    this.listeners.clear()
  }
}

// Global instance for easy access
export const componentRegistry = ComponentRegistry.getInstance()

// Helper functions for main application integration
export function getAvailableWorkflows(): WorkflowTemplate[] {
  return componentRegistry.getAllWorkflows()
}

export function getAvailableComponents(): ComponentDefinition[] {
  return componentRegistry.getAllComponents()
}

export function executeWorkflowById(workflowId: string): Promise<any> {
  const workflow = componentRegistry.getWorkflow(workflowId)
  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`)
  }

  // This would integrate with the main application's execution engine
  // For now, return a placeholder
  return Promise.resolve({
    workflowId,
    executed: true,
    result: 'Workflow executed successfully'
  })
}

export function getWorkflowById(workflowId: string): WorkflowTemplate | undefined {
  return componentRegistry.getWorkflow(workflowId)
}

export function getComponentById(componentId: string): ComponentDefinition | undefined {
  return componentRegistry.getComponent(componentId)
}