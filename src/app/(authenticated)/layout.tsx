'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { authService, type User } from '@/services/authService'
import AuthenticatedNavbar from '@/components/AuthenticatedNavbar'

/**
 * Layout para páginas autenticadas
 * 
 * Este layout actúa como una plantilla base para todas las páginas que requieren autenticación.
 * Proporciona funcionalidades comunes como:
 * - Protección automática de rutas mediante AuthGuard
 * - Navbar compartido con información del usuario
 * - Contexto de usuario disponible para páginas hijas
 * - Manejo centralizado del estado de autenticación
 * 
 * Cualquier página dentro del directorio (authenticated) automáticamente
 * heredará esta protección y estructura visual.
 */

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

/**
 * Contexto para compartir información del usuario autenticado
 * Este contexto permite que cualquier componente hijo acceda a la información
 * del usuario sin necesidad de hacer peticiones adicionales al servidor
 */
const UserContext = React.createContext<{
  user: User | null
  refreshUser: () => Promise<void>
  isLoading: boolean
} | null>(null)

export function useAuthenticatedUser() {
  const context = React.useContext(UserContext)
  if (!context) {
    throw new Error('useAuthenticatedUser debe usarse dentro de AuthenticatedLayout')
  }
  return context
}

/**
 * Componente interno que maneja el estado del usuario autenticado
 * Se ejecuta solo después de que AuthGuard ha verificado la autenticación
 */
function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Función para cargar/refrescar información del usuario
   * Esta función se puede llamar desde cualquier componente hijo
   * para actualizar la información del usuario
   */
  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const userInfo = await authService.getProfile()
      setUser(userInfo.user)
      console.log('✅ Usuario cargado en layout:', userInfo.user.user_name)
    } catch (error) {
      console.error('❌ Error cargando perfil de usuario:', error)
      // Si hay error cargando el perfil, probablemente la sesión expiró
      // El AuthGuard manejará esto automáticamente
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Cargar información del usuario al montar el componente
   * Solo se ejecuta una vez cuando el layout se inicializa
   */
  useEffect(() => {
    refreshUser()
  }, [])

  /**
   * Valor del contexto que se compartirá con todos los componentes hijos
   */
  const contextValue = {
    user,
    refreshUser,
    isLoading
  }

  return (
    <UserContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        {/* 
          Navbar compartido para todas las páginas autenticadas
          Este navbar tiene acceso al usuario y maneja funciones comunes
          como logout, navegación, configuración, etc.
        */}
        <AuthenticatedNavbar user={user} onUserUpdate={refreshUser} />
        
        {/* 
          Área de contenido principal
          Aquí se renderizarán las páginas específicas (dashboard, usuarios, etc.)
        */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </UserContext.Provider>
  )
}

/**
 * Layout principal para páginas autenticadas
 * Este es el componente que Next.js renderizará automáticamente
 * para cualquier página dentro del directorio (authenticated)
 */
export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <AuthGuard redirectTo="/">
      <AuthenticatedContent>
        {children}
      </AuthenticatedContent>
    </AuthGuard>
  )
}

/**
 * Hook personalizado para usar el contexto de usuario
 * Permite que cualquier componente acceda fácilmente a la información del usuario
 * 
 * Ejemplo de uso:
 * const { user, refreshUser, isLoading } = useAuthenticatedUser()
 */