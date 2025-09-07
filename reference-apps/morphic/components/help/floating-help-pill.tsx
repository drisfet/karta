'use client'

import { useEffect,useRef, useState } from 'react'

import { StudioHelpChat } from './help-chat'

interface FloatingHelpPillProps {
  className?: string
}

export function FloatingHelpPill({ className = "" }: FloatingHelpPillProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const pillRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isExpanded) return

    e.preventDefault()
    setIsDragging(true)
    const rect = panelRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  // Handle mouse move for dragging with throttling
  useEffect(() => {
    let animationFrame: number

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      // Use requestAnimationFrame for smooth updates
      if (animationFrame) return

      animationFrame = requestAnimationFrame(() => {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Constrain to viewport
        const maxX = window.innerWidth - 400 // Panel width
        const maxY = window.innerHeight - 600 // Panel height

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        })

        animationFrame = 0
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isDragging, dragOffset])

  // Prevent dragging when clicking on interactive elements
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      e.stopPropagation()
    }
  }

  return (
    <>
      {/* Floating Pill */}
      <div
        ref={pillRef}
        className={`fixed z-50 transition-all duration-300 ease-in-out ${className}`}
        style={{
          bottom: '20px',
          left: '320px', // Position next to node palette (assuming ~300px width)
          transform: isExpanded ? 'scale(0)' : 'scale(1)',
          opacity: isExpanded ? 0 : 1,
        }}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>

          {/* Help icon with pulse animation */}
          <div className="relative">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-300 opacity-0 group-hover:opacity-60 group-hover:animate-ping"></div>
          </div>

          {/* Text */}
          <span className="text-sm font-medium whitespace-nowrap">Need Help?</span>

          {/* Arrow indicator */}
          <div className="w-4 h-4 flex items-center justify-center">
            <svg
              className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Expanded Help Panel */}
      {isExpanded && (
        <div
          ref={panelRef}
          className="fixed z-50 transition-all duration-300 ease-in-out"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: isExpanded ? 'scale(1)' : 'scale(0.8)',
            opacity: isExpanded ? 1 : 0,
          }}
          onClick={handleClick}
        >
          <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden w-[450px] h-[550px] flex flex-col">
            {/* Header - Draggable */}
            <div
              className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 cursor-move select-none flex-shrink-0"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Studio Help</h3>
                  <p className="text-sm text-muted-foreground">Ask me anything about Agent Studio</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(false)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Chat Content - Fixed height container */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100% - 80px)' }}>
              <StudioHelpChat
                chatId="floating-studio-help"
                compactMode={true}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  )
}