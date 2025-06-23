'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Database, 
  Users, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  Shield,
  UserPlus,
  Menu,
  X
} from 'lucide-react'
import { authService, type User as UserType } from '@/services/authService'

interface AuthenticatedNavbarProps {
  user: UserType | null
  onUserUpdate?: () => Promise<void>
}

/**
 * Navbar para páginas autenticadas
 * 
 * Este componente proporciona navegación consistente para toda la aplicación autenticada.
 * Características principales:
 * - Logo y branding de la aplicación
 * - Navegación principal (Dashboard, Usuarios, etc.)
 * - Dropdown de usuario con opciones de perfil y configuración
 * - Logout funcional
 * - Responsive design para móviles
 * - Indicador visual del usuario actual y su rol
 */
export default function AuthenticatedNavbar({ user, onUserUpdate }: AuthenticatedNavbarProps) {
  // Estados para manejar la UI del navbar
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Referencias para manejar clicks fuera del dropdown
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  /**
   * Cerrar dropdown cuando se hace click fuera de él
   * Este patrón es estándar para mejorar la UX en dropdowns
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Funciones de navegación
   * Estas funciones manejan la navegación a diferentes secciones de la app
   */
  const navigateToSection = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false) // Cerrar menú móvil después de navegar
  }

  /**
   * Manejo del logout
   * Incluye feedback visual y manejo de errores
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setIsUserMenuOpen(false)
      
      await authService.logout()
      console.log('✅ Logout exitoso desde navbar')
      
      // Redirigir al login
      window.location.href = '/'
    } catch (error) {
      console.error('❌ Error durante logout:', error)
      // Incluso si hay error, redirigir al login por seguridad
      window.location.href = '/'
    }
  }

  /**
   * Generar iniciales del usuario para el avatar
   * Fallback elegante cuando no hay imagen de perfil
   */
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  /**
   * Elementos de navegación principal
   * Definidos como array para fácil mantenimiento y reutilización
   */
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: Database,
      description: 'Vista general del sistema'
    },
    {
      name: 'Usuarios',
      path: '/users',
      icon: Users,
      description: 'Gestionar usuarios del sistema'
    },
    {
      name: 'Roles',
      path: '/roles',
      icon: Shield,
      description: 'Configurar roles y permisos'
    }
  ]

  /**
   * Opciones del dropdown de usuario
   * Organizadas por categoría para mejor UX
   */
  const userMenuItems = [
    {
      section: 'Cuenta',
      items: [
        {
          name: 'Mi Perfil',
          path: '/profile',
          icon: User,
          description: 'Ver y editar información personal'
        },
        {
          name: 'Configuración',
          path: '/settings',
          icon: Settings,
          description: 'Preferencias y configuración'
        }
      ]
    }
  ]

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y marca */}
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-3">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Megabase</h1>
            </div>
          </div>

          {/* Navegación principal - Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => navigateToSection(item.path)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200"
                    title={item.description}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Usuario y dropdown - Desktop */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              
              {/* Botón rápido para crear usuario */}
              <button
                onClick={() => navigateToSection('/users/create')}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200 mr-4"
                title="Crear nuevo usuario"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nuevo Usuario</span>
              </button>

              {/* Dropdown de usuario */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200"
                  disabled={isLoggingOut}
                >
                  {/* Avatar del usuario */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user ? getUserInitials(user.name) : 'U'}
                  </div>
                  
                  {/* Información del usuario */}
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {user?.name || 'Cargando...'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {user?.role?.display_name || 'Usuario'}
                    </div>
                  </div>
                  
                  {/* Icono de dropdown */}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Menú dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    
                    {/* Header del dropdown con info del usuario */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user ? getUserInitials(user.name) : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.email}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            {user?.role?.display_name}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Opciones del menú */}
                    {userMenuItems.map((section, sectionIndex) => (
                      <div key={sectionIndex}>
                        {section.items.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.path}
                              onClick={() => {
                                navigateToSection(item.path)
                                setIsUserMenuOpen(false)
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              title={item.description}
                            >
                              <Icon className="w-4 h-4 text-gray-400" />
                              <span>{item.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    ))}

                    {/* Separador */}
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    {/* Opción de logout */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            
            {/* Información del usuario móvil */}
            <div className="flex items-center space-x-3 px-3 py-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user ? getUserInitials(user.name) : 'U'}
              </div>
              <div>
                <div className="text-white font-medium">{user?.name}</div>
                <div className="text-slate-400 text-sm">{user?.role?.display_name}</div>
              </div>
            </div>

            {/* Navegación móvil */}
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigateToSection(item.path)}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              )
            })}

            {/* Opciones del usuario móvil */}
            <div className="border-t border-slate-700 pt-3 mt-3">
              {userMenuItems[0].items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => navigateToSection(item.path)}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
              
              {/* Logout móvil */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-3 w-full px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}