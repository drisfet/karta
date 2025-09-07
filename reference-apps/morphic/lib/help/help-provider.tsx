'use client'

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

interface HelpDocument {
  id: string
  title: string
  content: string
  path: string
  category: string
  lastModified: string
}

interface HelpSearchResult {
  document: HelpDocument
  relevance: number
  excerpt: string
}

interface HelpContextValue {
  isInitialized: boolean
  searchHelp: (query: string, category?: string) => Promise<HelpSearchResult[]>
  getDocument: (id: string) => Promise<HelpDocument | null>
  getCategoryDocuments: (category: string) => Promise<HelpDocument[]>
  getCategories: () => Promise<string[]>
  getFormattedHelp: (query: string, category?: string) => Promise<string>
  refreshHelp: () => Promise<void>
}

const HelpContext = createContext<HelpContextValue | null>(null)

interface HelpProviderProps {
  children: ReactNode
  autoInitialize?: boolean
}

export function HelpProvider({
  children,
  autoInitialize = true
}: HelpProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [apiCallInProgress, setApiCallInProgress] = useState(false)
  const cache = useRef(new Map<string, any>())

  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      // Test the API connection
      testHelpAPI()
        .then(() => setIsInitialized(true))
        .catch(error => {
          console.error('Failed to initialize help system:', error)
          setIsInitialized(false)
        })
    }
  }, [autoInitialize]) // Removed isInitialized to prevent infinite loop

  const testHelpAPI = async (): Promise<void> => {
    try {
      const response = await fetch('/api/help?action=categories')
      if (!response.ok) {
        throw new Error('Help API not available')
      }
      const data = await response.json()
      if (!data.categories) {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      throw error
    }
  }

  const searchHelp = async (query: string, category?: string): Promise<HelpSearchResult[]> => {
    try {
      const params = new URLSearchParams({
        action: 'search',
        query
      })
      if (category) {
        params.append('category', category)
      }

      const response = await fetch(`/api/help?${params}`)
      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Help search failed:', error)
      return []
    }
  }

  const getDocument = async (id: string): Promise<HelpDocument | null> => {
    try {
      const response = await fetch(`/api/help?action=document&id=${encodeURIComponent(id)}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Document request failed')
      }

      const data = await response.json()
      return data.document || null
    } catch (error) {
      console.error('Failed to get help document:', error)
      return null
    }
  }

  const getCategoryDocuments = async (category: string): Promise<HelpDocument[]> => {
    try {
      const response = await fetch(`/api/help?action=category&category=${encodeURIComponent(category)}`)
      if (!response.ok) {
        throw new Error('Category request failed')
      }

      const data = await response.json()
      return data.documents || []
    } catch (error) {
      console.error('Failed to get category documents:', error)
      return []
    }
  }

  const getCategories = async (): Promise<string[]> => {
    try {
      const response = await fetch('/api/help?action=categories')
      if (!response.ok) {
        throw new Error('Categories request failed')
      }

      const data = await response.json()
      return data.categories || []
    } catch (error) {
      console.error('Failed to get categories:', error)
      return []
    }
  }

  const getFormattedHelp = async (query: string, category?: string): Promise<string> => {
    try {
      const params = new URLSearchParams({
        action: 'formatted',
        query
      })
      if (category) {
        params.append('category', category)
      }

      const response = await fetch(`/api/help?${params}`)
      if (!response.ok) {
        throw new Error('Formatted help request failed')
      }

      const data = await response.json()
      return data.help || `Sorry, I couldn't find help for "${query}". Please try rephrasing your question.`
    } catch (error) {
      console.error('Failed to get formatted help:', error)
      return `Sorry, I couldn't find help for "${query}". Please try rephrasing your question.`
    }
  }

  const refreshHelp = async (): Promise<void> => {
    // For now, just re-test the connection
    // In a more advanced implementation, this could trigger a cache refresh on the server
    try {
      await testHelpAPI()
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to refresh help system:', error)
      setIsInitialized(false)
    }
  }

  const contextValue: HelpContextValue = {
    isInitialized,
    searchHelp,
    getDocument,
    getCategoryDocuments,
    getCategories,
    getFormattedHelp,
    refreshHelp
  }

  return (
    <HelpContext.Provider value={contextValue}>
      {children}
    </HelpContext.Provider>
  )
}

export function useHelp(): HelpContextValue {
  const context = useContext(HelpContext)
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider')
  }
  return context
}

// Hook for getting help content formatted for AI chat
export function useHelpChat() {
  const { getFormattedHelp, isInitialized } = useHelp()
  const [isLoading, setIsLoading] = useState(false)
  const lastQueryRef = useRef<string>('')
  const lastCategoryRef = useRef<string>('')
  const lastResultRef = useRef<string>('')

  const getHelpContext = useCallback(async (userQuery: string, category?: string): Promise<string> => {
    // For streaming compatibility, use a simple system prompt
    // The complex help context was causing streaming parsing errors
    const systemPrompt = `You are a helpful AI assistant for the Morphic application.

Guidelines for your responses:
- Be concise but comprehensive
- Always maintain a friendly, professional tone
- If you need clarification, ask specific questions
- For technical issues, provide step-by-step troubleshooting guidance

User's question: "${userQuery}"

Note: This is a help chat for the ${category || 'Morphic'} application. Provide relevant assistance based on the context.`

    return systemPrompt
  }, [])

  return { getHelpContext, isInitialized, isLoading }
}