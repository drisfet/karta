'use client'

import { useEffect, useRef } from 'react'

import { ToolInvocation } from 'ai'

import { ShoppingResults } from '@/lib/tools/shopping'

import { CollapsibleMessage } from './collapsible-message'
import { Section, ToolArgsSection } from './section'

interface ShoppingSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  chatId: string
}

export function ShoppingSection({
  tool,
  isOpen,
  onOpenChange,
  chatId
}: ShoppingSectionProps) {
  const result: ShoppingResults | undefined =
    tool.state === 'result' ? tool.result : undefined

  // Handle UI_INTENT if present (only once per tool result)
  useEffect(() => {
    if (result?.ui_intents && (window as any).panelAPI) {
      const panelKey = `shopping-panel-${result.query}`

      // Check if we've already created a panel for this query
      if (!(window as any)[panelKey]) {
        console.log('🛒 Creating shopping panel for query:', result.query)
        result.ui_intents.forEach(intent => {
          if (intent.type === 'OPEN_PANEL') {
            ;(window as any).panelAPI.createPanel(intent.panel, intent.props.title, intent.props)
            ;(window as any)[panelKey] = true
          }
        })
      } else {
        console.log('⚠️ Shopping panel already exists for query:', result.query)
      }
    }
  }, [result])

  const query = tool.args?.query as string | undefined
  const header = (
    <ToolArgsSection
      tool="shopping"
      number={result?.products?.length}
    >
      {query || 'Product search'}
    </ToolArgsSection>
  )

  const renderContent = () => {
    if (tool.state === 'call') {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Searching for products...
        </div>
      )
    }

    if (tool.state === 'result' && result) {
      const products = result.products || []

      return (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Found {products.length} products for "{result.query}" across {new Set(products.map(p => p.retailer)).size} retailers
          </div>

          {products.length > 0 && (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {products.slice(0, 5).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {product.name}
                    </div>
                    <div className="text-primary font-semibold">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {product.retailer}
                    </div>
                  </div>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    View →
                  </a>
                </div>
              ))}

              {products.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  And {products.length - 5} more products...
                </div>
              )}
            </div>
          )}

          {products.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No products found. Try a different search term.
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showIcon={false}
    >
      <Section>
        {renderContent()}
      </Section>
    </CollapsibleMessage>
  )
}