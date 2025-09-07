'use client'

import { useEffect, useMemo, useState } from 'react'

import { ChatRequestOptions, JSONValue, Message } from 'ai'

import { cn } from '@/lib/utils'

import { RenderMessage } from '../render-message'
import { ToolSection } from '../tool-section'
import { Spinner } from '../ui/spinner'

// Import section structure interface
interface ChatSection {
  id: string
  userMessage: Message
  assistantMessages: Message[]
}

interface PanelChatMessagesProps {
  sections: ChatSection[]
  data: JSONValue[] | undefined
  onQuerySelect: (query: string) => void
  isLoading: boolean
  chatId: string
  addToolResult?: (params: { toolCallId: string; result: any }) => void
  scrollContainerRef: React.RefObject<HTMLDivElement>
  onUpdateMessage?: (messageId: string, newContent: string) => Promise<void>
  reload?: (
    messageId: string,
    options?: ChatRequestOptions
  ) => Promise<string | null | undefined>
  compactMode?: boolean
}

export function PanelChatMessages({
  sections,
  data,
  onQuerySelect,
  isLoading,
  chatId,
  addToolResult,
  scrollContainerRef,
  onUpdateMessage,
  reload,
  compactMode = false
}: PanelChatMessagesProps) {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})
  const manualToolCallId = 'manual-tool-call'

  useEffect(() => {
    // Open manual tool call when the last section is a user message
    if (sections.length > 0) {
      const lastSection = sections[sections.length - 1]
      if (lastSection.userMessage.role === 'user') {
        setOpenStates({ [manualToolCallId]: true })
      }
    }
  }, [sections])

  // get last tool data for manual tool call
  const lastToolData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null

    const lastItem = data[data.length - 1] as {
      type: 'tool_call'
      data: {
        toolCallId: string
        state: 'call' | 'result'
        toolName: string
        args: string
      }
    }

    if (lastItem.type !== 'tool_call') return null

    const toolData = lastItem.data
    return {
      state: 'call' as const,
      toolCallId: toolData.toolCallId,
      toolName: toolData.toolName,
      args: toolData.args ? JSON.parse(toolData.args) : undefined
    }
  }, [data])

  if (!sections.length) return null

  // Get all messages as a flattened array
  const allMessages = sections.flatMap(section => [
    section.userMessage,
    ...section.assistantMessages
  ])

  const lastUserIndex =
    allMessages.length -
    1 -
    [...allMessages].reverse().findIndex(msg => msg.role === 'user')

  // Check if loading indicator should be shown
  const showLoading =
    isLoading &&
    sections.length > 0 &&
    sections[sections.length - 1].assistantMessages.length === 0

  const getIsOpen = (id: string) => {
    if (id.includes('call')) {
      return openStates[id] ?? true
    }
    const baseId = id.endsWith('-related') ? id.slice(0, -8) : id
    const index = allMessages.findIndex(msg => msg.id === baseId)
    return openStates[id] ?? index >= lastUserIndex
  }

  const handleOpenChange = (id: string, open: boolean) => {
    setOpenStates(prev => ({
      ...prev,
      [id]: open
    }))
  }

  return (
    <div
      id="panel-scroll-container"
      ref={scrollContainerRef}
      role="list"
      aria-roledescription="panel chat messages"
      className={cn(
        'relative size-full overflow-y-auto',
        sections.length > 0 ? 'flex-1' : '',
        compactMode ? 'px-2 py-1' : 'px-4 py-2'
      )}
    >
      <div className={cn(
        'relative mx-auto w-full',
        compactMode ? 'max-w-full' : 'max-w-3xl'
      )}>
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            id={`panel-section-${section.id}`}
            className={cn(
              'panel-chat-section',
              compactMode ? 'mb-2' : 'mb-4'
            )}
            style={
              sectionIndex === sections.length - 1
                ? { minHeight: compactMode ? 'calc(-120px + 100%)' : 'calc(-160px + 100%)' }
                : {}
            }
          >
            {/* User message */}
            <div className={cn(
              'flex flex-col gap-2',
              compactMode ? 'mb-1' : 'mb-2'
            )}>
              <RenderMessage
                message={section.userMessage}
                messageId={section.userMessage.id}
                getIsOpen={getIsOpen}
                onOpenChange={handleOpenChange}
                onQuerySelect={onQuerySelect}
                chatId={chatId}
                addToolResult={addToolResult}
                onUpdateMessage={onUpdateMessage}
                reload={reload}
              />
              {showLoading && <Spinner />}
            </div>

            {/* Assistant messages */}
            {section.assistantMessages.map(assistantMessage => (
              <div key={assistantMessage.id} className={cn(
                'flex flex-col gap-2',
                compactMode ? 'mb-1' : 'mb-2'
              )}>
                <RenderMessage
                  message={assistantMessage}
                  messageId={assistantMessage.id}
                  getIsOpen={getIsOpen}
                  onOpenChange={handleOpenChange}
                  onQuerySelect={onQuerySelect}
                  chatId={chatId}
                  addToolResult={addToolResult}
                  onUpdateMessage={onUpdateMessage}
                  reload={reload}
                />
              </div>
            ))}
          </div>
        ))}

        {showLoading && lastToolData && (
          <ToolSection
            key={manualToolCallId}
            tool={lastToolData}
            isOpen={getIsOpen(manualToolCallId)}
            onOpenChange={open => handleOpenChange(manualToolCallId, open)}
            addToolResult={addToolResult}
            chatId={chatId}
          />
        )}
      </div>
    </div>
  )
}