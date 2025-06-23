'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, X } from 'lucide-react'

export function ThemeDebugger() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isVisible) return null

  const htmlClasses = typeof document !== 'undefined' ? document.documentElement.className : 'no disponible'
  const isDarkMode = htmlClasses.includes('dark')

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-card border border-border rounded-lg shadow-lg z-50 min-w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-card-foreground">Debug de Tema</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong className="text-card-foreground">Tema seleccionado:</strong></p>
            <p className="text-muted-foreground">{theme}</p>
          </div>
          <div>
            <p><strong className="text-card-foreground">Tema resuelto:</strong></p>
            <p className="text-muted-foreground">{resolvedTheme}</p>
          </div>
        </div>
        
        <div>
          <p><strong className="text-card-foreground">Clase HTML actual:</strong></p>
          <p className="text-muted-foreground text-xs break-all">{htmlClasses}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <p><strong className="text-card-foreground">Modo oscuro activo:</strong></p>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isDarkMode 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {isDarkMode ? 'SÍ' : 'NO'}
          </span>
        </div>
      </div>
      
      {/* Controles rápidos de tema */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Cambiar tema
        </p>
        <div className="flex space-x-2">
          {[
            { value: 'light', icon: Sun, label: 'Claro' },
            { value: 'dark', icon: Moon, label: 'Oscuro' },
            { value: 'system', icon: Monitor, label: 'Sistema' }
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                theme === value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Prueba de colores */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Prueba de colores
        </p>
        <div className="grid grid-cols-5 gap-2">
          <div className="space-y-1">
            <div className="w-6 h-6 bg-background border border-border rounded"></div>
            <p className="text-xs text-muted-foreground">bg</p>
          </div>
          <div className="space-y-1">
            <div className="w-6 h-6 bg-card border border-border rounded"></div>
            <p className="text-xs text-muted-foreground">card</p>
          </div>
          <div className="space-y-1">
            <div className="w-6 h-6 bg-primary rounded"></div>
            <p className="text-xs text-muted-foreground">primary</p>
          </div>
          <div className="space-y-1">
            <div className="w-6 h-6 bg-secondary rounded"></div>
            <p className="text-xs text-muted-foreground">secondary</p>
          </div>
          <div className="space-y-1">
            <div className="w-6 h-6 bg-muted rounded"></div>
            <p className="text-xs text-muted-foreground">muted</p>
          </div>
        </div>
        
        <div className="mt-3 text-xs space-y-1">
          <div className="flex space-x-4">
            <span className="text-foreground">foreground</span>
            <span className="text-muted-foreground">muted-foreground</span>
          </div>
          <div className="flex space-x-4">
            <span className="text-card-foreground">card-foreground</span>
            <span className="text-primary">primary</span>
          </div>
        </div>
      </div>

      {/* Botón para ocultar */}
      <div className="mt-4 pt-3 border-t border-border">
        <button 
          onClick={() => setIsVisible(false)}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ocultar debugger
        </button>
      </div>
    </div>
  )
}