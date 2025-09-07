'use client'

import { useEffect, useState } from 'react'

import { Message } from 'ai/react'

import { useHelpChat } from '@/lib/help/help-provider'
import { Model } from '@/lib/types/models'

import { PanelChat } from '../panel-chat/panel-chat'

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
  const { getHelpContext, isInitialized } = useHelpChat()
  const [initialMessages, setInitialMessages] = useState<Message[]>([])
  const [isLoadingHelp, setIsLoadingHelp] = useState(false)

  // Prepare initial help context when component mounts or category changes
  useEffect(() => {
    const prepareHelpContext = async () => {
      if (!isInitialized) return

      setIsLoadingHelp(true)

      try {
        let helpQuery = initialQuery || "How can I get started with this section?"
        const helpContext = await getHelpContext(helpQuery, category)

        // Create initial system message with help context
        const systemMessage: Message = {
          id: 'help-system-context',
          role: 'system',
          content: helpContext,
          createdAt: new Date()
        }

        // Create initial user message if specified
        const userMessage: Message = {
          id: 'help-initial-query',
          role: 'user',
          content: helpQuery,
          createdAt: new Date()
        }

        setInitialMessages([systemMessage, userMessage])
      } catch (error) {
        console.error('Failed to prepare help context:', error)

        // Fallback to basic help message
        const fallbackMessage: Message = {
          id: 'help-fallback',
          role: 'assistant',
          content: `I'm here to help you with questions about this section. The help system is currently loading. Please try again in a moment, or ask me a specific question about what you're trying to do.`,
          createdAt: new Date()
        }

        setInitialMessages([fallbackMessage])
      } finally {
        setIsLoadingHelp(false)
      }
    }

    prepareHelpContext()
  }, [isInitialized, category, initialQuery, getHelpContext])

  // Handle message sent to potentially update help context
  const handleMessageSent = async (message: string) => {
    if (!isInitialized) return

    try {
      // Get updated help context based on the user's message
      const updatedContext = await getHelpContext(message, category)

      // This context can be used to enhance future responses
      // The actual chat will handle the conversation flow
      console.log('Updated help context for:', message)
    } catch (error) {
      console.error('Failed to update help context:', error)
    }
  }

  // Custom placeholder based on loading state
  const getPlaceholder = () => {
    if (isLoadingHelp) {
      return "Loading help system..."
    }
    if (!isInitialized) {
      return "Initializing help..."
    }
    return placeholder
  }

  return (
    <div className={`help-chat ${className}`}>
      <PanelChat
        chatId={`${chatId}-help`}
        models={models}
        initialMessages={initialMessages}
        placeholder={getPlaceholder()}
        className="help-chat-panel"
        onMessageSent={handleMessageSent}
        compactMode={compactMode}
      />

      {/* Loading indicator */}
      {isLoadingHelp && (
        <div className="help-loading-indicator">
          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Preparing help context...
          </div>
        </div>
      )}

      {/* Help system status */}
      {!isInitialized && !isLoadingHelp && (
        <div className="help-status-indicator">
          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Help system initializing...
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