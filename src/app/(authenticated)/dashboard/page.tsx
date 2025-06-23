'use client'

import { Database, User, Shield, Settings, TrendingUp, Activity } from 'lucide-react'
import { useAuthenticatedUser } from '../layout'

/**
 * Dashboard Page - Vista principal del sistema
 * 
 * Esta página ahora es mucho más simple porque:
 * - No maneja autenticación (delegada al layout)
 * - No maneja navbar (delegado al layout)
 * - Se enfoca únicamente en mostrar información del dashboard
 * - Accede al usuario a través del contexto compartido
 */
export default function DashboardPage() {
  // Acceder al usuario desde el contexto del layout
  const { user, isLoading } = useAuthenticatedUser()

  // Datos simulados para el dashboard (en el futuro vendrán de APIs)
  const dashboardStats = {
    totalUsers: 156,
    activeUsers: 142,
    totalRoles: 8,
    systemUptime: '99.8%'
  }

  const recentActivity = [
    { id: 1, action: 'Usuario creado', user: 'Ana García', time: '2 minutos' },
    { id: 2, action: 'Rol modificado', user: 'Carlos López', time: '15 minutos' },
    { id: 3, action: 'Usuario activado', user: 'María Silva', time: '1 hora' },
    { id: 4, action: 'Configuración actualizada', user: 'Admin', time: '2 horas' }
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header del dashboard */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido de nuevo, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Aquí tienes un resumen de la actividad del sistema Megabase.
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total de usuarios */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</h3>
              <p className="text-sm text-gray-600">Total Usuarios</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+12% este mes</span>
          </div>
        </div>

        {/* Usuarios activos */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.activeUsers}</h3>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+5% esta semana</span>
          </div>
        </div>

        {/* Total de roles */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.totalRoles}</h3>
              <p className="text-sm text-gray-600">Roles Configurados</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-600 text-sm">Sin cambios</span>
          </div>
        </div>

        {/* Uptime del sistema */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.systemUptime}</h3>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">Excelente</span>
          </div>
        </div>
      </div>

      {/* Secciones adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Actividad reciente */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span> por {activity.user}
                  </p>
                  <p className="text-xs text-gray-500">hace {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              Ver toda la actividad →
            </button>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-4">
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <User className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Crear Usuario</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Shield className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Gestionar Roles</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Configuración</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Database className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Base de Datos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Información del usuario actual (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Debug: Información del Usuario (solo en desarrollo)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">ID:</span>
              <span className="ml-2 text-gray-900">{user?.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Username:</span>
              <span className="ml-2 text-gray-900">{user?.user_name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Rol ID:</span>
              <span className="ml-2 text-gray-900">{user?.role_id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}