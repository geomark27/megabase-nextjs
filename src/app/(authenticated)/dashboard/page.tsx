'use client'

import { Database, User, Shield, Settings, TrendingUp, Activity, Sparkles } from 'lucide-react'
import { useAuthenticatedUser } from '../layout'

/**
 * Dashboard Page - Vista principal del sistema
 * Diseño elegante y armonioso para modo dark
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
          <div className="h-8 bg-muted/50 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted/30 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header del dashboard - Más elegante */}
        <div className="mb-8 relative">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  ¡Bienvenido de nuevo, {user?.name}!
                </h1>
                <p className="text-muted-foreground text-lg">
                  Aquí tienes un resumen de la actividad del sistema Megabase.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas principales - Diseño más elegante */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total de usuarios */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-foreground">{dashboardStats.totalUsers}</h3>
                  <p className="text-sm text-muted-foreground">Total Usuarios</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">+12% este mes</span>
              </div>
            </div>
          </div>

          {/* Usuarios activos */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-foreground">{dashboardStats.activeUsers}</h3>
                  <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">+5% esta semana</span>
              </div>
            </div>
          </div>

          {/* Total de roles */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-foreground">{dashboardStats.totalRoles}</h3>
                  <p className="text-sm text-muted-foreground">Roles Configurados</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
                <span className="text-muted-foreground text-sm">Sin cambios</span>
              </div>
            </div>
          </div>

          {/* Uptime del sistema */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-foreground">{dashboardStats.systemUptime}</h3>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Excelente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones adicionales - Diseño mejorado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Actividad reciente */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl blur-xl"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Actividad Reciente</h3>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-green-400 animate-pulse' : 
                      index === 1 ? 'bg-blue-400' : 
                      index === 2 ? 'bg-yellow-400' : 'bg-purple-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.action}</span> por{' '}
                        <span className="text-primary">{activity.user}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">hace {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-border/50">
                <button className="group flex items-center space-x-2 text-primary hover:text-primary/80 text-sm font-medium transition-all duration-200">
                  <span>Ver toda la actividad</span>
                  <div className="w-4 h-4 transition-transform group-hover:translate-x-1">→</div>
                </button>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl blur-xl"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Accesos Rápidos</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: User, label: 'Crear Usuario', color: 'blue' },
                  { icon: Shield, label: 'Gestionar Roles', color: 'purple' },
                  { icon: Settings, label: 'Configuración', color: 'gray' },
                  { icon: Database, label: 'Base de Datos', color: 'green' }
                ].map(({ icon: Icon, label, color }, index) => (
                  <button 
                    key={index}
                    className="group relative flex flex-col items-center p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                      color === 'gray' ? 'bg-muted-foreground/20 text-muted-foreground' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Información del usuario actual (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-muted/30 backdrop-blur-sm rounded-xl p-4 border border-border/30">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Debug: Información del Usuario (solo en desarrollo)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-muted-foreground">ID:</span>
                <span className="text-foreground font-mono">{user?.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-muted-foreground">Username:</span>
                <span className="text-foreground font-mono">{user?.user_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-muted-foreground">Rol ID:</span>
                <span className="text-foreground font-mono">{user?.role_id}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}