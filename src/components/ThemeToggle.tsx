// components/ThemeToggle.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-20 mb-2"></div>
          <div className="space-y-1">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-t border-border">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Apariencia
      </div>
      <div className="space-y-1">
        {[
          { value: 'light', label: 'Tema Claro', icon: Sun },
          { value: 'dark', label: 'Tema Oscuro', icon: Moon },
          { value: 'system', label: 'Automático', icon: Monitor }
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              theme === value 
                ? 'bg-accent text-accent-foreground border border-border' 
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon className={`w-4 h-4 ${
              theme === value ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className="flex-1 text-left">{label}</span>
            {theme === value && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}