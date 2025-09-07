/**
 * Performance optimization utilities for Agent Studio
 */

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private performanceMarks: Map<string, number> = new Map()

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  /**
   * Start performance measurement
   */
  startMeasurement(key: string): void {
    this.performanceMarks.set(`${key}_start`, performance.now())
  }

  /**
   * End performance measurement and return duration
   */
  endMeasurement(key: string): number {
    const startKey = `${key}_start`
    const endKey = `${key}_end`

    const startTime = this.performanceMarks.get(startKey)
    if (!startTime) {
      console.warn(`Performance measurement '${key}' was not started`)
      return 0
    }

    const endTime = performance.now()
    this.performanceMarks.set(endKey, endTime)

    const duration = endTime - startTime
    console.log(`Performance: ${key} took ${duration.toFixed(2)}ms`)

    return duration
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
      }
    }
    return null
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  /**
   * Optimize React Flow performance settings
   */
  static getOptimizedReactFlowSettings() {
    return {
      // Optimize large workflows
      minZoom: 0.1,
      maxZoom: 2,
      defaultZoom: 1,

      // Performance settings
      elevateNodesOnSelect: false,
      elevateEdgesOnSelect: false,

      // Connection settings
      connectionLineStyle: { strokeWidth: 2 },
      connectionLineType: 'bezier',

      // Selection settings
      selectionKeyCode: 'Shift',
      multiSelectionKeyCode: 'Meta',

      // Pan settings
      panOnDrag: [1, 2], // Left and middle mouse buttons
      selectionOnDrag: false,

      // Zoom settings
      zoomOnScroll: true,
      zoomOnPinch: true,
      zoomOnDoubleClick: false
    }
  }

  /**
   * Optimize node data processing
   */
  static optimizeNodeData(nodeData: any) {
    return {
      // Memoize expensive computations
      displayName: getNodeDisplayName(nodeData),

      // Optimize status updates
      statusClass: getStatusClass(nodeData.status),

      // Cache computed values
      isValid: true, // Placeholder for validation
      performanceMetrics: { renderTime: 0, updateFrequency: 0 }
    }
  }

  /**
   * Batch updates efficiently
   */
  static batchUpdates(updates: (() => void)[]) {
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  }

  /**
   * Optimize data flow animations
   */
  static optimizeDataFlow(edges: any[], activeFlows: Set<string>) {
    return edges.map(edge => ({
      ...edge,
      animated: activeFlows.has(edge.id),
      style: {
        ...edge.style,
        strokeWidth: activeFlows.has(edge.id) ? 3 : 2,
        stroke: activeFlows.has(edge.id) ? '#10b981' : '#64748b'
      }
    }))
  }

  /**
   * Clean up performance marks
   */
  cleanup(): void {
    this.performanceMarks.clear()
  }
}

// Helper functions for optimization
function getNodeDisplayName(nodeData: any): string {
  switch (nodeData.type) {
    case 'agentNode':
      return nodeData.config?.type === 'researcher' ? 'Researcher Agent' : 'Manual Researcher'
    case 'toolNode':
      return `${nodeData.config?.type} Tool`
    case 'dataNode':
      return `${nodeData.config?.type} Data`
    case 'logicNode':
      return nodeData.config?.type || 'Logic'
    case 'uiNode':
      return 'UI Panel'
    default:
      return 'Unknown Node'
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'running':
      return 'border-blue-500 bg-blue-50'
    case 'completed':
      return 'border-green-500 bg-green-50'
    case 'error':
      return 'border-red-500 bg-red-50'
    default:
      return 'border-gray-300 bg-white'
  }
}

// Helper functions for performance optimization

// Performance optimization utilities

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance()