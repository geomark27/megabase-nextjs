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
import { ThemeToggle } from '@/components/ThemeToggle' // 🆕 Agregar import

interface AuthenticatedNavbarProps {
  user: UserType | null
  onUserUpdate?: () => Promise<void>
}

export default function AuthenticatedNavbar({ user, onUserUpdate }: AuthenticatedNavbarProps) {
  // ... tus estados existentes (mantener igual) ...
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // ... tus funciones existentes (mantener igual) ...
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigateToSection = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setIsUserMenuOpen(false)
      await authService.logout()
      console.log('✅ Logout exitoso desde navbar')
      window.location.href = '/'
    } catch (error) {
      console.error('❌ Error durante logout:', error)
      window.location.href = '/'
    }
  }

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
    // 🔧 ACTUALIZADO: Usar variables semánticas
    <nav className="bg-sidebar border-b border-sidebar-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y marca */}
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg mr-3">
                <Database className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-sidebar-foreground">Megabase</h1>
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
                    // 🔧 ACTUALIZADO: Usar variables semánticas
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-200"
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
              
              {/* Dropdown de usuario */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  // 🔧 ACTUALIZADO: Usar variables semánticas
                  className="flex items-center space-x-3 p-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-200"
                  disabled={isLoggingOut}
                >
                  {/* Avatar del usuario */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user ? getUserInitials(user.name) : 'U'}
                  </div>
                  
                  {/* Información del usuario */}
                  <div className="text-left">
                    <div className="text-sm font-medium text-sidebar-foreground">
                      {user?.name || 'Cargando...'}
                    </div>
                    <div className="text-xs text-sidebar-foreground/60">
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
                  // 🔧 ACTUALIZADO: Usar variables semánticas
                  <div className="absolute right-0 mt-2 w-64 bg-popover rounded-lg shadow-lg border border-border py-2 z-50">
                    
                    {/* Header del dropdown con info del usuario */}
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user ? getUserInitials(user.name) : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-popover-foreground">
                            {user?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user?.email}
                          </div>
                          <div className="text-xs text-primary font-medium">
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
                              // 🔧 ACTUALIZADO: Usar variables semánticas
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                              title={item.description}
                            >
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span>{item.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    ))}

                    {/* 🆕 Theme Toggle */}
                    <ThemeToggle />
                    
                    {/* Separador */}
                    <div className="border-t border-border my-2"></div>
                    
                    {/* Opción de logout */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      // 🔧 ACTUALIZADO: Usar variables semánticas
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
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
              // 🔧 ACTUALIZADO: Usar variables semánticas
              className="p-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
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
        // 🔧 ACTUALIZADO: Usar variables semánticas
        <div className="md:hidden bg-sidebar border-t border-sidebar-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            
            {/* Información del usuario móvil */}
            <div className="flex items-center space-x-3 px-3 py-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user ? getUserInitials(user.name) : 'U'}
              </div>
              <div>
                <div className="text-sidebar-foreground font-medium">{user?.name}</div>
                <div className="text-sidebar-foreground/60 text-sm">{user?.role?.display_name}</div>
              </div>
            </div>

            {/* Navegación móvil */}
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigateToSection(item.path)}
                  // 🔧 ACTUALIZADO: Usar variables semánticas
                  className="flex items-center space-x-3 w-full px-3 py-2 text-left text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              )
            })}

            {/* Opciones del usuario móvil */}
            <div className="border-t border-sidebar-border pt-3 mt-3">
              {userMenuItems[0].items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => navigateToSection(item.path)}
                    // 🔧 ACTUALIZADO: Usar variables semánticas
                    className="flex items-center space-x-3 w-full px-3 py-2 text-left text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
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
                // 🔧 ACTUALIZADO: Usar variables semánticas
                className="flex items-center space-x-3 w-full px-3 py-2 text-left text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
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