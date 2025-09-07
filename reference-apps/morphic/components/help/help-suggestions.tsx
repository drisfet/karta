'use client'

import { useEffect, useState } from 'react'

import { ArrowRight, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface HelpSuggestion {
  heading: string
  message: string
}

interface HelpSuggestionsProps {
  category: string
  onSuggestionClick: (message: string) => void
  className?: string
}

export function HelpSuggestions({
  category,
  onSuggestionClick,
  className = ""
}: HelpSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<HelpSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/help?action=suggestions&category=${encodeURIComponent(category)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.status}`)
        }

        const data = await response.json()

        setSuggestions(data.suggestions || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load suggestions')

        // Fallback to default suggestions
        setSuggestions([
          {
            heading: 'Getting started guide',
            message: 'How do I get started with this feature?'
          },
          {
            heading: 'Basic usage instructions',
            message: 'What are the basic steps to use this?'
          },
          {
            heading: 'Common questions',
            message: 'What are some common questions about this?'
          },
          {
            heading: 'Advanced features',
            message: 'What advanced features are available?'
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [category])

  if (isLoading) {
    return (
      <div className={`mx-auto w-full transition-all ${className}`}>
        <div className="bg-background p-2">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
            <span className="text-sm text-muted-foreground">Loading suggestions...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && suggestions.length === 0) {
    return (
      <div className={`mx-auto w-full transition-all ${className}`}>
        <div className="bg-background p-2">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Unable to load suggestions. Using defaults.
            </p>
            <div className="flex flex-col items-start space-y-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="link"
                  className="h-auto p-0 text-base"
                  onClick={() => onSuggestionClick(suggestion.message)}
                >
                  <ArrowRight size={16} className="mr-2 text-muted-foreground" />
                  {suggestion.heading}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-purple-500" />
          <span className="text-sm font-medium text-foreground">Suggested Questions</span>
        </div>

        {/* Suggestions */}
        <div className="flex flex-col items-start space-y-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base hover:bg-muted/50 rounded-md px-2 py-1 transition-colors group"
              onClick={() => onSuggestionClick(suggestion.message)}
            >
              <ArrowRight
                size={16}
                className="mr-2 text-muted-foreground group-hover:text-purple-500 transition-colors"
              />
              <span className="group-hover:text-purple-700 transition-colors">
                {suggestion.heading}
              </span>
            </Button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            These suggestions are generated from the help documentation
          </p>
        </div>
      </div>
    </div>
  )
}