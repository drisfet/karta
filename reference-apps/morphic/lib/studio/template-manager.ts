import { Edge,Node } from '@xyflow/react'

import { ComponentDefinition, TemplateLibrary,WorkflowTemplate } from '@/lib/types/studio'

export class TemplateManager {
  private static readonly STORAGE_KEY = 'agent-studio-templates'
  private static readonly COMPONENTS_KEY = 'agent-studio-components'

  // Workflow Template Management
  static saveWorkflowTemplate(
    name: string,
    description: string,
    category: WorkflowTemplate['category'],
    tags: string[],
    nodes: Node[],
    edges: Edge[]
  ): WorkflowTemplate {
    const template: WorkflowTemplate = {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      tags,
      nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
      edges: JSON.parse(JSON.stringify(edges)), // Deep clone
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        author: 'Agent Studio User',
        usageCount: 0,
        rating: 0
      }
    }

    const templates = this.getWorkflowTemplates()
    templates.push(template)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates))

    return template
  }

  static getWorkflowTemplates(): WorkflowTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return this.getDefaultTemplates()

      const templates = JSON.parse(stored)
      // Convert date strings back to Date objects
      return templates.map((template: any) => ({
        ...template,
        metadata: {
          ...template.metadata,
          createdAt: new Date(template.metadata.createdAt),
          updatedAt: new Date(template.metadata.updatedAt)
        }
      }))
    } catch (error) {
      console.error('Error loading workflow templates:', error)
      return this.getDefaultTemplates()
    }
  }

  static loadWorkflowTemplate(templateId: string): WorkflowTemplate | null {
    const templates = this.getWorkflowTemplates()
    const template = templates.find(t => t.id === templateId)

    if (template) {
      // Increment usage count
      template.metadata.usageCount++
      this.updateWorkflowTemplate(template)
    }

    return template || null
  }

  static updateWorkflowTemplate(template: WorkflowTemplate): void {
    const templates = this.getWorkflowTemplates()
    const index = templates.findIndex(t => t.id === template.id)

    if (index !== -1) {
      templates[index] = { ...template, metadata: { ...template.metadata, updatedAt: new Date() } }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates))
    }
  }

  static deleteWorkflowTemplate(templateId: string): boolean {
    const templates = this.getWorkflowTemplates()
    const filteredTemplates = templates.filter(t => t.id !== templateId)

    if (filteredTemplates.length !== templates.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTemplates))
      return true
    }

    return false
  }

  // Component Definition Management
  static saveComponentDefinition(
    name: string,
    type: ComponentDefinition['type'],
    description: string,
    category: string,
    configuration: Record<string, any>,
    workflow?: WorkflowTemplate
  ): ComponentDefinition {
    const component: ComponentDefinition = {
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      description,
      category,
      configuration,
      workflow,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        author: 'Agent Studio User'
      }
    }

    const components = this.getComponentDefinitions()
    components.push(component)
    localStorage.setItem(this.COMPONENTS_KEY, JSON.stringify(components))

    return component
  }

  static getComponentDefinitions(): ComponentDefinition[] {
    try {
      const stored = localStorage.getItem(this.COMPONENTS_KEY)
      if (!stored) return []

      const components = JSON.parse(stored)
      // Convert date strings back to Date objects
      return components.map((component: any) => ({
        ...component,
        metadata: {
          ...component.metadata,
          createdAt: new Date(component.metadata.createdAt),
          updatedAt: new Date(component.metadata.updatedAt)
        }
      }))
    } catch (error) {
      console.error('Error loading component definitions:', error)
      return []
    }
  }

  static getComponentDefinition(componentId: string): ComponentDefinition | null {
    const components = this.getComponentDefinitions()
    return components.find(c => c.id === componentId) || null
  }

  static deleteComponentDefinition(componentId: string): boolean {
    const components = this.getComponentDefinitions()
    const filteredComponents = components.filter(c => c.id !== componentId)

    if (filteredComponents.length !== components.length) {
      localStorage.setItem(this.COMPONENTS_KEY, JSON.stringify(filteredComponents))
      return true
    }

    return false
  }

  // Export/Import Functionality
  static exportWorkflowTemplate(templateId: string): string | null {
    const template = this.loadWorkflowTemplate(templateId)
    if (!template) return null

    return JSON.stringify(template, null, 2)
  }

  static importWorkflowTemplate(templateJson: string): WorkflowTemplate | null {
    try {
      const template = JSON.parse(templateJson) as WorkflowTemplate

      // Validate required fields
      if (!template.id || !template.name || !template.nodes) {
        throw new Error('Invalid template format')
      }

      // Add to templates
      const templates = this.getWorkflowTemplates()
      templates.push(template)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates))

      return template
    } catch (error) {
      console.error('Error importing workflow template:', error)
      return null
    }
  }

  static exportComponentDefinition(componentId: string): string | null {
    const component = this.getComponentDefinition(componentId)
    if (!component) return null

    return JSON.stringify(component, null, 2)
  }

  static importComponentDefinition(componentJson: string): ComponentDefinition | null {
    try {
      const component = JSON.parse(componentJson) as ComponentDefinition

      // Validate required fields
      if (!component.id || !component.name || !component.type) {
        throw new Error('Invalid component format')
      }

      // Add to components
      const components = this.getComponentDefinitions()
      components.push(component)
      localStorage.setItem(this.COMPONENTS_KEY, JSON.stringify(components))

      return component
    } catch (error) {
      console.error('Error importing component definition:', error)
      return null
    }
  }

  // Default Templates
  private static getDefaultTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'default-research-workflow',
        name: 'Research Assistant',
        description: 'Complete research workflow with search and synthesis',
        category: 'research',
        tags: ['research', 'search', 'analysis'],
        nodes: [
          {
            id: '1',
            type: 'agentNode',
            position: { x: 250, y: 100 },
            data: {
              type: 'researcher',
              config: {
                model: 'gpt-4',
                temperature: 0.7,
                maxSteps: 10,
                tools: ['search', 'retrieve']
              },
              status: 'idle'
            }
          },
          {
            id: '2',
            type: 'toolNode',
            position: { x: 100, y: 300 },
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
            id: '3',
            type: 'dataNode',
            position: { x: 400, y: 300 },
            data: {
              type: 'output',
              config: {
                dataType: 'string',
                validation: { required: true }
              }
            }
          }
        ],
        edges: [
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'default'
          },
          {
            id: 'e2-3',
            source: '2',
            target: '3',
            type: 'default'
          }
        ],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          author: 'Agent Studio',
          usageCount: 0,
          rating: 5
        }
      }
    ]
  }

  // Utility Methods
  static getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
    return this.getWorkflowTemplates().filter(template => template.category === category)
  }

  static getComponentsByType(type: ComponentDefinition['type']): ComponentDefinition[] {
    return this.getComponentDefinitions().filter(component => component.type === type)
  }

  static searchTemplates(query: string): WorkflowTemplate[] {
    const templates = this.getWorkflowTemplates()
    const lowerQuery = query.toLowerCase()

    return templates.filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  static clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.COMPONENTS_KEY)
  }
}