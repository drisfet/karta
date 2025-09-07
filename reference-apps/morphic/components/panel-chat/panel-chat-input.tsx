'use client'

import { useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'

import { Message } from 'ai'
import { ArrowUp } from 'lucide-react'

import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'

import { ModelSelector } from '../model-selector'
import { SearchModeToggle } from '../search-mode-toggle'
import { Button } from '../ui/button'

interface PanelChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  placeholder?: string
  models?: Model[]
  compactMode?: boolean
  messages?: Message[]
  showModelSelector?: boolean
  showSearchToggle?: boolean
}

export function PanelChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  placeholder = "Ask a question...",
  models,
  compactMode = false,
  messages = [],
  showModelSelector = true,
  showSearchToggle = true
}: PanelChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [enterDisabled, setEnterDisabled] = useState(false)

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e)
  }

  return (
    <div className={cn(
      'w-full bg-background shrink-0 border-t',
      compactMode ? 'px-2 py-2' : 'px-4 py-3'
    )}>
      <form
        onSubmit={onSubmit}
        className={cn('max-w-full w-full mx-auto')}
      >
        <div className={cn(
          'relative flex flex-col w-full gap-2 bg-muted rounded-lg border border-input',
          compactMode ? 'p-2' : 'p-3'
        )}>
          <Textarea
            ref={inputRef}
            name="input"
            rows={1}
            maxRows={compactMode ? 3 : 5}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            spellCheck={false}
            value={input}
            disabled={isLoading}
            className={cn(
              'resize-none w-full min-h-8 bg-transparent border-0',
              'placeholder:text-muted-foreground focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              compactMode ? 'text-sm p-1' : 'text-sm p-2'
            )}
            onChange={e => {
              handleInputChange(e)
            }}
            onKeyDown={e => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !isComposing &&
                !enterDisabled
              ) {
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
              }
            }}
          />

          {/* Bottom controls */}
          <div className={cn(
            'flex items-center justify-between',
            compactMode ? 'gap-1' : 'gap-2'
          )}>
            <div className="flex items-center gap-2">
              {showModelSelector && (
                <ModelSelector models={models || []} />
              )}
              {showSearchToggle && (
                <SearchModeToggle />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type={isLoading ? 'button' : 'submit'}
                size={compactMode ? 'sm' : 'sm'}
                variant={'outline'}
                className={cn(
                  isLoading && 'animate-pulse',
                  'rounded-full',
                  compactMode ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'
                )}
                disabled={
                  (input.length === 0 && !isLoading)
                }
              >
                <ArrowUp size={compactMode ? 12 : 16} />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}