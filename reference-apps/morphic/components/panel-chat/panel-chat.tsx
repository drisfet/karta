'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useChat } from '@ai-sdk/react'
import { ChatRequestOptions } from 'ai'
import { Message } from 'ai/react'

import { Model } from '@/lib/types/models'

import { PanelChatInput } from './panel-chat-input'
import { PanelChatMessages } from './panel-chat-messages'

// Define section structure
interface ChatSection {
  id: string // User message ID
  userMessage: Message
  assistantMessages: Message[]
}

interface PanelChatProps {
  chatId: string
  models?: Model[]
  initialMessages?: Message[]
  placeholder?: string
  className?: string
  onMessageSent?: (message: string) => void
  compactMode?: boolean // For smaller panels
}

export function PanelChat({
  chatId,
  models,
  initialMessages = [],
  placeholder = "Ask a question...",
  className = "",
  onMessageSent,
  compactMode = false
}: PanelChatProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)
  const autoSubmitTimeoutRef = useRef<NodeJS.Timeout>()

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
    stop,
    data,
    setData,
    addToolResult,
    reload
  } = useChat({
    initialMessages,
    id: chatId,
    body: { id: chatId },
    onFinish: () => {
      // Custom finish handler for panels
      onMessageSent?.(messages[messages.length - 1]?.content || '')
    },
    onError: error => {
      console.error('Panel chat error:', error)
    },
    sendExtraMessageFields: false,
    experimental_throttle: 100
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  /**
   * AUTO-SUBMIT FEATURE FOR PANEL INITIAL MESSAGES
   *
   * This useEffect automatically submits the initial message in a panel after a 1-second delay.
   * This creates a seamless user experience where panels immediately start processing their queries.
   *
   * IMPLEMENTATION APPROACH:
   * - Uses the exact same function (`handleUpdateAndReloadMessage`) that gets called when you
   *   manually edit a message and click "Save"
   * - This ensures consistent behavior and leverages proven, tested code
   * - No DOM manipulation or complex form handling needed
   *
   * TIMING:
   * - 1-second delay allows the panel to fully render and stabilize
   * - Prevents race conditions with component mounting
   *
   * GUARDS:
   * - Only runs once per panel (hasAutoSubmitted prevents duplicates)
   * - Only runs when useChat is in 'ready' state
   * - Only runs when not currently loading
   * - Only runs for messages with 'user' role
   *
   * FUTURE IMPROVEMENTS:
   * - Could be made configurable (delay time, enable/disable)
   * - Could add visual feedback during the delay
   * - Could be extended to support different auto-submit strategies
   */
  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === initialMessages.length && status === 'ready' && !hasAutoSubmitted) {
      // Only auto-submit if we have initial messages and haven't started processing yet
      const hasUserMessage = initialMessages.some(msg => msg.role === 'user')

      if (hasUserMessage && !isLoading) {
        setHasAutoSubmitted(true)

        // Use the exact same function that gets called when you edit and save a message
        autoSubmitTimeoutRef.current = setTimeout(async () => {
          try {
            const initialMessageId = initialMessages[0].id
            // This is the exact same call that happens when you click "Save" after editing
            await handleUpdateAndReloadMessage(initialMessageId, initialMessages[0].content)
          } catch (error) {
            console.error('Auto-submit failed:', error)
          }
        }, 1000); // 1 second delay for auto-submission
      }
    }
  }, [initialMessages, messages.length, status, isLoading, hasAutoSubmitted])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current)
      }
    }
  }, [])

  // Convert messages array to sections array
  const sections = useMemo<ChatSection[]>(() => {
    const result: ChatSection[] = []
    let currentSection: ChatSection | null = null

    for (const message of messages) {
      if (message.role === 'user') {
        // Start a new section when a user message is found
        if (currentSection) {
          result.push(currentSection)
        }
        currentSection = {
          id: message.id,
          userMessage: message,
          assistantMessages: []
        }
      } else if (currentSection && message.role === 'assistant') {
        // Add assistant message to the current section
        currentSection.assistantMessages.push(message)
      }
      // Ignore other role types for panels
    }

    // Add the last section if exists
    if (currentSection) {
      result.push(currentSection)
    }

    return result
  }, [messages])

  // Detect if scroll container is at the bottom
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 50 // threshold in pixels
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        setIsAtBottom(true)
      } else {
        setIsAtBottom(false)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Set initial state

    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to the section when a new user message is sent
  useEffect(() => {
    if (sections.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user') {
        const sectionId = lastMessage.id
        requestAnimationFrame(() => {
          const sectionElement = document.getElementById(`panel-section-${sectionId}`)
          sectionElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    }
  }, [sections, messages])

  const onQuerySelect = (query: string) => {
    // Handle query selection in panels
    console.log('Panel query selected:', query)
  }

  const handleUpdateAndReloadMessage = async (
    messageId: string,
    newContent: string
  ) => {
    setMessages(currentMessages =>
      currentMessages.map(msg =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    )

    try {
      const messageIndex = messages.findIndex(msg => msg.id === messageId)
      if (messageIndex === -1) return

      const messagesUpToEdited = messages.slice(0, messageIndex + 1)
      setMessages(messagesUpToEdited)
      setData(undefined)

      await reload({
        body: {
          chatId,
          regenerate: true
        }
      })
    } catch (error) {
      console.error('Failed to reload after message update:', error)
    }
  }

  const handleReloadFrom = async (
    messageId: string,
    options?: ChatRequestOptions
  ) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      const userMessageIndex = messages
        .slice(0, messageIndex)
        .findLastIndex(m => m.role === 'user')
      if (userMessageIndex !== -1) {
        const trimmedMessages = messages.slice(0, userMessageIndex + 1)
        setMessages(trimmedMessages)
        return await reload(options)
      }
    }
    return await reload(options)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setData(undefined)
    handleSubmit(e)
  }

  return (
    <div className={`flex h-full min-w-0 flex-1 flex-col ${className}`}>
      <PanelChatMessages
        sections={sections}
        data={data}
        onQuerySelect={onQuerySelect}
        isLoading={isLoading}
        chatId={chatId}
        addToolResult={addToolResult}
        scrollContainerRef={scrollContainerRef}
        onUpdateMessage={handleUpdateAndReloadMessage}
        reload={handleReloadFrom}
        compactMode={compactMode}
      />
      <PanelChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        placeholder={placeholder}
        models={models}
        compactMode={compactMode}
      />
    </div>
  )
}