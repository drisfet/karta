'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Message } from 'ai/react'

import { useHelpChat } from '@/lib/help/help-provider'
import { Model } from '@/lib/types/models'

import { PanelChat } from '../panel-chat/panel-chat'

import { HelpSuggestions } from './help-suggestions'

interface HelpChatProps {
  chatId: string
  models?: Model[]
  className?: string
  compactMode?: boolean
  category?: string // Specific help category (e.g., 'studio', 'main-app')
  placeholder?: string
  initialQuery?: string // Auto-start with a specific question
}

export function HelpChat({
  chatId,
  models,
  className = "",
  compactMode = false,
  category,
  placeholder = "Ask me anything about this section...",
  initialQuery
}: HelpChatProps) {
  const { getHelpContext, isInitialized, isLoading } = useHelpChat()
  const [initialMessages, setInitialMessages] = useState<Message[]>([])
  const [isLoadingHelp, setIsLoadingHelp] = useState(false)
  const [lastMessageTime, setLastMessageTime] = useState<number>(0)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [appendFunction, setAppendFunction] = useState<((message: { role: 'user'; content: string }) => void) | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const hasInitializedRef = useRef(false)

  // Prepare initial help context - only once on mount
  useEffect(() => {
    // Prevent infinite loops by using a ref to track initialization
    if (hasInitializedRef.current || initialMessages.length > 0) return

    // Only proceed if help system is initialized
    if (!isInitialized) return

    hasInitializedRef.current = true

    const prepareHelpContext = async () => {
      setIsLoadingHelp(true)

      try {
        // Create a simple welcome message
        const welcomeMessage: Message = {
          id: 'help-welcome',
          role: 'assistant',
          content: `Welcome to the help system! I'm here to assist you with questions about the ${category || 'Morphic'} application. What would you like to know?`,
          createdAt: new Date()
        }

        setInitialMessages([welcomeMessage])
      } catch (error) {
        console.error('Failed to prepare help context:', error)

        const fallbackMessage: Message = {
          id: 'help-fallback',
          role: 'assistant',
          content: `I'm here to help you with questions about this section. Please ask me a specific question.`,
          createdAt: new Date()
        }

        setInitialMessages([fallbackMessage])
      } finally {
        setIsLoadingHelp(false)
      }
    }

    // Add a small delay to ensure component is fully mounted
    const timeoutId = setTimeout(() => {
      prepareHelpContext()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, []) // Empty dependency array - only run once on mount

  // Handle message sent - this is called by PanelChat after AI response
  const handleMessageSent = async (message: string) => {
    // Hide suggestions once user starts chatting
    setShowSuggestions(false)

    // For RAG-based help, we don't need to pre-load context
    // The help agent handles retrieval dynamically for each query
    if (!isInitialized || message.length < 3) return

    // Optional: Could implement follow-up context caching here
    // But for now, each query is handled independently by the RAG system
  }

  // Handle suggestion click - use the append function to send message directly
  const handleSuggestionClick = useCallback((message: string) => {
    // Hide suggestions immediately
    setShowSuggestions(false)

    // Use the append function if available
    if (appendFunction) {
      appendFunction({
        role: 'user',
        content: message
      })
    }
  }, [appendFunction])

  // Handle message count changes to show/hide suggestions
  const handleMessageCountChange = useCallback((count: number) => {
    setMessageCount(count)
    // Hide suggestions if there are any messages
    if (count > 0) {
      setShowSuggestions(false)
    }
  }, [])

  // Memoize the appendMessage callback to prevent infinite re-renders
  const handleAppendMessage = useCallback((appendFn: (message: { role: 'user'; content: string }) => void) => {
    setAppendFunction(() => appendFn)
  }, [])

  // Custom placeholder based on loading state
  const getPlaceholder = () => {
    if (isLoadingHelp || isLoading) {
      return "Loading help system..."
    }
    if (!isInitialized) {
      return "Initializing help..."
    }
    return placeholder
  }

  return (
    <div className={`help-chat h-full flex flex-col ${className}`}>
      {/* Loading indicator */}
      {isLoadingHelp && (
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground flex-shrink-0">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
          Preparing help context...
        </div>
      )}

      {/* Help system status */}
      {!isInitialized && !isLoadingHelp && (
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground flex-shrink-0">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
          Help system initializing...
        </div>
      )}

      {/* Chat Interface */}
      {isInitialized && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Show suggestions when no messages and suggestions enabled */}
          {showSuggestions && messageCount === 0 && isInitialized && !isLoadingHelp && (
            <div className="flex-shrink-0">
              <HelpSuggestions
                category={category || 'studio'}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          )}

          {/* Chat messages and input */}
          <div className="flex-1 flex flex-col min-h-0">
            <PanelChat
              chatId={`${chatId}-help`}
              models={models}
              initialMessages={initialMessages}
              placeholder={getPlaceholder()}
              className="flex-1 min-h-0"
              onMessageSent={handleMessageSent}
              compactMode={compactMode}
              appendMessage={handleAppendMessage}
              onMessageCountChange={handleMessageCountChange}
              section={category}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized help chat for the Agent Studio
export function StudioHelpChat(props: Omit<HelpChatProps, 'category'>) {
  return (
    <HelpChat
      {...props}
      category="studio"
      placeholder="Ask me about Agent Studio workflows, nodes, or troubleshooting..."
      initialQuery="What can I do in the Agent Studio?"
    />
  )
}

// Specialized help chat for the main application
export function MainAppHelpChat(props: Omit<HelpChatProps, 'category'>) {
  return (
    <HelpChat
      {...props}
      category="main-app"
      placeholder="Ask me about the main application features..."
      initialQuery="How do I get started with the main application?"
    />
  )
}