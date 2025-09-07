// Integration Example: How to use Agent Studio components in the main Morphic application

import { ComponentDefinition,WorkflowTemplate } from '@/lib/types/studio'

import { componentRegistry, executeWorkflowById,getAvailableComponents, getAvailableWorkflows } from './component-registry'

// Example 1: Load all available workflows for the main application
export function loadStudioWorkflows(): WorkflowTemplate[] {
  return getAvailableWorkflows()
}

// Example 2: Load all available components for the main application
export function loadStudioComponents(): ComponentDefinition[] {
  return getAvailableComponents()
}

// Example 3: Execute a workflow created in Agent Studio
export async function executeStudioWorkflow(workflowId: string): Promise<any> {
  try {
    const result = await executeWorkflowById(workflowId)
    console.log('Studio workflow executed:', result)
    return result
  } catch (error) {
    console.error('Failed to execute studio workflow:', error)
    throw error
  }
}

// Example 4: Create a custom agent from a studio workflow
export function createAgentFromWorkflow(workflowId: string) {
  const workflow = componentRegistry.getWorkflow(workflowId)

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`)
  }

  // Convert workflow to agent configuration
  const agentConfig = {
    name: workflow.name,
    description: workflow.description,
    workflow: workflow,
    execute: async (input: any) => {
      // This would integrate with the main application's execution engine
      console.log(`Executing custom agent: ${workflow.name}`)
      return { result: 'Custom agent executed', input }
    }
  }

  return agentConfig
}

// Example 5: Create a custom tool from a studio component
export function createToolFromComponent(componentId: string) {
  const component = componentRegistry.getComponent(componentId)

  if (!component) {
    throw new Error(`Component ${componentId} not found`)
  }

  // Convert component to tool configuration
  const toolConfig = {
    name: component.name,
    description: component.description,
    type: component.type,
    configuration: component.configuration,
    execute: async (input: any) => {
      // This would integrate with the main application's tool execution
      console.log(`Executing custom tool: ${component.name}`)
      return { result: 'Custom tool executed', input }
    }
  }

  return toolConfig
}

// Example 6: Register event listeners for real-time updates
export function setupStudioIntegration() {
  // Listen for new workflows created in Agent Studio
  componentRegistry.addListener((type, action, id) => {
    if (type === 'workflow' && action === 'add') {
      console.log(`New workflow created in Agent Studio: ${id}`)
      // Here you could automatically register the workflow with the main app
      const workflow = componentRegistry.getWorkflow(id)
      if (workflow) {
        console.log('Workflow details:', workflow.name, workflow.description)
      }
    }

    if (type === 'component' && action === 'add') {
      console.log(`New component created in Agent Studio: ${id}`)
      // Here you could automatically register the component with the main app
      const component = componentRegistry.getComponent(id)
      if (component) {
        console.log('Component details:', component.name, component.type)
      }
    }
  })
}

// Example 7: Search and filter studio content
export function searchStudioContent(query: string) {
  const workflows = componentRegistry.searchWorkflows(query)
  const components = componentRegistry.searchComponents(query)

  return {
    workflows,
    components,
    total: workflows.length + components.length
  }
}

// Example 8: Get usage statistics
export function getStudioStats() {
  return componentRegistry.getStats()
}

// Example 9: Export studio content for sharing
export function exportStudioWorkflow(workflowId: string): string | null {
  return componentRegistry.exportWorkflow(workflowId)
}

export function exportStudioComponent(componentId: string): string | null {
  return componentRegistry.exportComponent(componentId)
}

// Example 10: Import shared studio content
export function importStudioWorkflow(workflowJson: string): WorkflowTemplate | null {
  return componentRegistry.importWorkflow(workflowJson)
}

export function importStudioComponent(componentJson: string): ComponentDefinition | null {
  return componentRegistry.importComponent(componentJson)
}

// Example Usage in Main Application:
//
// 1. Initialize integration
// setupStudioIntegration()
//
// 2. Load available content
// const workflows = loadStudioWorkflows()
// const components = loadStudioComponents()
//
// 3. Use in your application
// const customAgent = createAgentFromWorkflow(workflows[0].id)
// const customTool = createToolFromComponent(components[0].id)
//
// 4. Execute workflows
// const result = await executeStudioWorkflow(workflows[0].id)
//
// 5. Monitor for new content
// componentRegistry.addListener((type, action, id) => {
//   if (type === 'workflow' && action === 'add') {
//     // Handle new workflow created in Agent Studio
//     refreshWorkflowList()
//   }
// })

export default {
  loadStudioWorkflows,
  loadStudioComponents,
  executeStudioWorkflow,
  createAgentFromWorkflow,
  createToolFromComponent,
  setupStudioIntegration,
  searchStudioContent,
  getStudioStats,
  exportStudioWorkflow,
  exportStudioComponent,
  importStudioWorkflow,
  importStudioComponent
}