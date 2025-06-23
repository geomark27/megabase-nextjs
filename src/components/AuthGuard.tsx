'use client'

import { useState, useEffect } from 'react'
import { Database } from 'lucide-react'
import { authService, type User } from '@/services/authService'
import { getErrorMessage } from '@/lib/axios'

/**
 * Props para el componente AuthGuard
 */
interface AuthGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    redirectTo?: string
}

/**
 * Estados posibles de autenticación
 * Estos estados nos permiten manejar diferentes escenarios de manera explícita
 */
type AuthState = 
  | 'checking'     // Verificando autenticación en el servidor
  | 'authenticated' // Usuario autenticado correctamente
  | 'unauthenticated' // Usuario no autenticado
  | 'error'        // Error durante la verificación

/**
 * AuthGuard - Componente protector de rutas
 * 
 * Este componente implementa el patrón "guard" para proteger rutas que requieren autenticación.
 * Verifica la autenticación del usuario antes de renderizar cualquier contenido protegido.
 * 
 * Características clave:
 * - Verificación de autenticación antes del renderizado
 * - Estados explícitos para diferentes escenarios
 * - Redirección automática para usuarios no autenticados
 * - Pantalla de carga mientras se verifica la autenticación
 * - Manejo de errores de red o servidor
 */
export default function AuthGuard({ 
    children, 
    fallback, 
    redirectTo = '/' 
}: AuthGuardProps) {
    // Estados para manejar el flujo de autenticación
    const [authState, setAuthState] = useState<AuthState>('checking')
    const [user, setUser] = useState<User | null>(null)
    const [error, setError] = useState<string>('')

    /**
     * Verificar autenticación al montar el componente
     * Esta verificación se ejecuta UNA VEZ cuando el guard se monta
     */
    useEffect(() => {
        checkAuthentication()
    }, [])

    /**
     * Función principal de verificación de autenticación
     * Esta función centraliza toda la lógica de verificación
     */
    const checkAuthentication = async () => {
        try {
        // Limpiar estados previos
        setError('')
        setAuthState('checking')

        // Hacer la verificación con el backend
        const authResult = await authService.checkAuth()
        
        if (authResult.authenticated && authResult.user) {
            // Usuario autenticado: actualizar estados y permitir acceso
            setUser(authResult.user)
            setAuthState('authenticated')
            
            console.log('✅ AuthGuard: Usuario autenticado', {
            user: authResult.user.user_name,
            role: authResult.user.role?.name
            })
        } else {
            // Usuario no autenticado: marcar como no autenticado
            setAuthState('unauthenticated')
            
            console.log('❌ AuthGuard: Usuario no autenticado')
        }
        } catch (err) {
        // Error durante la verificación
        const errorMessage = getErrorMessage(err)
        setError(errorMessage)
        setAuthState('error')
        
        console.error('💥 AuthGuard: Error verificando autenticación', err)
        }
    }

    /**
     * Función para redirigir al usuario
     * Centraliza la lógica de redirección para mantener consistencia
     */
    const redirectUser = (destination: string) => {
        if (typeof window !== 'undefined') {
        console.log(`🔄 AuthGuard: Redirigiendo a ${destination}`)
        window.location.href = destination
        }
    }

    /**
     * Efecto para manejar redirecciones automáticas
     * Se ejecuta cuando cambia el estado de autenticación
     */
    useEffect(() => {
        if (authState === 'unauthenticated') {
        // Pequeño delay para evitar redirecciones abruptas
        const timeoutId = setTimeout(() => {
            redirectUser(redirectTo)
        }, 100)
        
        return () => clearTimeout(timeoutId)
        }
        
        if (authState === 'error') {
        // En caso de error, también redirigir después de un delay más largo
        const timeoutId = setTimeout(() => {
            redirectUser(redirectTo)
        }, 2000)
        
        return () => clearTimeout(timeoutId)
        }
    }, [authState, redirectTo])

    /**
     * Renderizado condicional basado en el estado de autenticación
     */
    
    // Estado: Verificando autenticación
    if (authState === 'checking') {
        return fallback || <DefaultLoadingScreen />
    }

    // Estado: Error durante verificación
    if (authState === 'error') {
        return <ErrorScreen error={error} onRetry={checkAuthentication} />
    }

    // Estado: Usuario no autenticado (mostrar brevemente antes de redirección)
    if (authState === 'unauthenticated') {
        return <UnauthenticatedScreen />
    }

    // Estado: Usuario autenticado - renderizar contenido protegido
    if (authState === 'authenticated' && user) {
        return <UserContextProvider user={user}>{children}</UserContextProvider>
    }

    // Estado fallback (no debería ocurrir)
    return <DefaultLoadingScreen />
}

/**
 * Pantalla de carga por defecto
 * Se muestra mientras se verifica la autenticación
 */
function DefaultLoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Database className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Verificando acceso...</h2>
            <p className="text-slate-400">Validando tu sesión</p>
            
            {/* Indicador de progreso visual */}
            <div className="mt-4 w-48 mx-auto">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            </div>
        </div>
        </div>
    )
}

/**
 * Pantalla de error
 * Se muestra cuando hay problemas durante la verificación
 */
function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Error de Verificación</h2>
            <p className="text-slate-300 mb-4">{error}</p>
            <div className="space-y-2">
            <button
                onClick={onRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
                Reintentar
            </button>
            <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
                Ir al Login
            </button>
            </div>
        </div>
        </div>
    )
}

/**
 * Pantalla para usuarios no autenticados
 * Se muestra brevemente antes de la redirección
 */
function UnauthenticatedScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600 rounded-2xl mb-4">
            <span className="text-white text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Acceso Requerido</h2>
            <p className="text-slate-400">Redirigiendo al login...</p>
        </div>
        </div>
    )
}

/**
 * Provider para compartir información del usuario autenticado
 * Permite que los componentes hijos accedan a la información del usuario
 */
function UserContextProvider({ user, children }: { user: User; children: React.ReactNode }) {
    // En el futuro, este provider podría usar React Context para compartir
    // la información del usuario con toda la aplicación
    return <>{children}</>
}

/**
 * Hook personalizado para usar el AuthGuard en otras partes de la aplicación
 * Puede ser útil para verificaciones de autenticación en componentes específicos
 */
export function useAuthGuard() {
    return {
        checkAuth: authService.checkAuth,
        logout: authService.logout
    }
}