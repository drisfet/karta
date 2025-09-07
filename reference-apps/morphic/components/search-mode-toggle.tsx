'use client'

import { useEffect, useState } from 'react'

import { Globe, HelpCircle, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'

import { Toggle } from './ui/toggle'

type SearchMode = 'off' | 'search' | 'help-only'

export function SearchModeToggle() {
  const [searchMode, setSearchMode] = useState<SearchMode>('search')

  useEffect(() => {
    const savedMode = getCookie('search-mode')
    if (savedMode && ['off', 'search', 'help-only'].includes(savedMode)) {
      setSearchMode(savedMode as SearchMode)
    } else {
      setCookie('search-mode', 'search')
    }
  }, [])

  const handleModeChange = () => {
    const nextMode: Record<SearchMode, SearchMode> = {
      'off': 'search',
      'search': 'help-only',
      'help-only': 'off'
    }

    const newMode = nextMode[searchMode]
    setSearchMode(newMode)
    setCookie('search-mode', newMode)
  }

  const getModeConfig = (mode: SearchMode) => {
    switch (mode) {
      case 'off':
        return {
          icon: X,
          label: 'Off',
          pressed: false,
          className: 'text-muted-foreground bg-background border-input'
        }
      case 'search':
        return {
          icon: Globe,
          label: 'Search',
          pressed: true,
          className: 'bg-accent-blue text-accent-blue-foreground border-accent-blue-border'
        }
      case 'help-only':
        return {
          icon: HelpCircle,
          label: 'Help',
          pressed: true,
          className: 'bg-purple-600 text-white border-purple-600'
        }
    }
  }

  const config = getModeConfig(searchMode)
  const Icon = config.icon

  return (
    <Toggle
      aria-label={`Toggle search mode - current: ${searchMode}`}
      pressed={config.pressed}
      onPressedChange={handleModeChange}
      variant="outline"
      className={cn(
        'gap-1 px-3 border text-muted-foreground bg-background',
        'hover:bg-accent hover:text-accent-foreground rounded-full transition-colors',
        config.className
      )}
    >
      <Icon className="size-4" />
      <span className="text-xs">{config.label}</span>
    </Toggle>
  )
}
