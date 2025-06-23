'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  MoreVertical,
  Shield,
  CheckCircle,
  XCircle,
  Sparkles,
  Mail,
  User as UserIcon
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthenticatedUser } from '../layout'
import { api } from '@/lib/axios'
import { getErrorMessage } from '@/lib/axios'
import { type User as UserType } from '@/services/authService'
import { UserSheet } from '@/components/users/UserSheet'

/**
 * Interfaz para usuarios de la lista
 */
interface UserListItem extends UserType {
  // Propiedades adicionales si las necesitas
}

/**
 * Página de gestión de usuarios con diseño elegante
 * Aplicando el mismo estilo armonioso del dashboard
 */
export default function UsersPage() {
  // Estados para la gestión de la página
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)

  // Estados simplificados para acciones
  const [deleteLoading, setDeleteLoading] = useState<{ [key: number]: boolean }>({})
  
  // Estados para el Sheet
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  
  // Acceso al contexto
  const { user: currentUser } = useAuthenticatedUser()
  const router = useRouter()

  /**
   * Cargar lista de usuarios al montar el componente
   */
  useEffect(() => {
    loadUsers()
  }, [showInactive, selectedRole])

  /**
   * Función para cargar usuarios desde la API
   */
  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Construir parámetros de query
      const params = new URLSearchParams()
      if (!showInactive) {
        params.append('include_inactive', 'true')
      }
      if (selectedRole !== 'all') {
        params.append('role_id', selectedRole)
      }

      console.log('🔄 Cargando usuarios con parámetros:', params.toString())

      const response = await api.get(`/users?${params.toString()}`)
      
      console.log('📥 Respuesta completa del servidor:', response.data)
      
      if (response.data.status === 'success') {
        const userData = response.data.data
        const usersList = userData?.users || []
        setUsers(usersList)
        console.log('✅ Usuarios cargados:', usersList.length, 'usuarios')
        
        if (usersList.length === 0) {
          console.log('⚠️ No se encontraron usuarios. Estructura de respuesta:', {
            status: response.data.status,
            message: response.data.message,
            dataKeys: Object.keys(response.data.data || {}),
            userData: userData
          })
        }
      } else {
        console.error('❌ Respuesta del servidor indica fallo:', response.data)
        setError(response.data.message || 'No se pudieron cargar los usuarios')
      }
    } catch (err: any) {
      console.error('❌ Error en la petición:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Abrir sheet para crear usuario
   */
  const openCreateSheet = () => {
    setSheetMode('create')
    setEditingUser(null)
    setSheetOpen(true)
  }

  /**
   * Abrir sheet para editar usuario
   */
  const openEditSheet = (user: UserListItem) => {
    setSheetMode('edit')
    setEditingUser(user)
    setSheetOpen(true)
  }

  /**
   * Manejar éxito del sheet (crear/editar)
   */
  const handleSheetSuccess = () => {
    loadUsers() // Recargar la lista de usuarios
    console.log(`✅ ${sheetMode === 'create' ? 'Usuario creado' : 'Usuario actualizado'} - Lista actualizada`)
  }

  /**
   * Función para eliminar usuario
   */
  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [userId]: true }))

      const response = await api.delete(`/users/${userId}`)

      if (response.data.status === 'success') {
        setUsers(prev => prev.filter(user => user.id !== userId))
        console.log(`✅ Usuario ${userName} eliminado`)
      }
    } catch (err: any) {
      console.error('❌ Error eliminando usuario:', err)
      setError(`Error al eliminar usuario: ${getErrorMessage(err)}`)
    } finally {
      setDeleteLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  /**
   * Función para filtrar usuarios basado en búsqueda
   */
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Header elegante */}
        <div className="mb-8 relative">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Gestión de Usuarios
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Administra los usuarios del sistema, sus roles y permisos.
                  </p>
                </div>
              </div>
              
              {/* Botón para crear usuario */}
              <button
                onClick={openCreateSheet}
                className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                <span>Nuevo Usuario</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y filtros elegantes */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl blur-xl"></div>
          <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              
              {/* Búsqueda elegante */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Filtros elegantes */}
              <div className="flex items-center space-x-4">
                
                {/* Filtro por rol */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="1">Administrador</option>
                    <option value="2">Editor</option>
                    <option value="3">Viewer</option>
                  </select>
                </div>

                {/* Toggle para usuarios inactivos */}
                <label className="flex items-center space-x-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/50"
                  />
                  <span>Incluir inactivos</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de error elegante */}
        {error && (
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent rounded-xl blur-xl"></div>
            <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => {
                  setError('')
                  loadUsers()
                }}
                className="mt-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{filteredUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Usuarios mostrados</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{users.filter(u => u.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Usuarios activos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{new Set(users.map(u => u.role_id)).size}</p>
                  <p className="text-sm text-muted-foreground">Roles diferentes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios elegante */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl blur-xl"></div>
          <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            
            {/* Loading state */}
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto mb-4"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-transparent animate-pulse"></div>
                </div>
                <p className="text-muted-foreground">Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              /* Empty state elegante */
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron usuarios</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'Intenta ajustar los filtros de búsqueda.' : 'Comienza creando tu primer usuario.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openCreateSheet}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Usuario</span>
                  </button>
                )}
              </div>
            ) : (
              /* Tabla con usuarios */
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Último acceso
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-accent/20 transition-colors">
                        
                        {/* Información del usuario */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center text-primary font-medium text-sm">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-foreground">{user.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                                <span>@{user.user_name}</span>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Rol */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 text-muted-foreground mr-2" />
                            <div>
                              <div className="text-sm font-medium text-foreground">{user.role?.display_name}</div>
                              <div className="text-xs text-muted-foreground">{user.role?.description}</div>
                            </div>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {user.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </span>
                        </td>

                        {/* Último acceso */}
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.last_login_at 
                            ? new Date(user.last_login_at).toLocaleDateString('es-ES')
                            : 'Nunca'
                          }
                        </td>

                        {/* Acciones con Dropdown Menu elegante */}
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="inline-flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                disabled={deleteLoading[user.id]}
                              >
                                {deleteLoading[user.id] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            
                            <DropdownMenuContent align="end" className="w-48 bg-card/90 backdrop-blur-sm border-border/50">
                              
                              {/* Editar usuario */}
                              <DropdownMenuItem
                                onClick={() => openEditSheet(user)}
                                className="flex items-center space-x-2 text-foreground hover:text-primary cursor-pointer hover:bg-accent/50"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Editar usuario</span>
                              </DropdownMenuItem>

                              {/* Eliminar usuario */}
                              <DropdownMenuItem
                                onClick={() => deleteUser(user.id, user.name)}
                                disabled={user.id === currentUser?.id}
                                className="flex items-center space-x-2 text-foreground hover:text-red-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Eliminar usuario</span>
                              </DropdownMenuItem>
                              
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Información de la tabla */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="text-foreground font-medium">{filteredUsers.length}</span> de{' '}
              <span className="text-foreground font-medium">{users.length}</span> usuarios
              {searchTerm && (
                <>
                  {' '}(filtrado por{' '}
                  <span className="text-primary font-medium">"{searchTerm}"</span>)
                </>
              )}
            </p>
          </div>
        )}

        {/* Sheet Component */}
        <UserSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          mode={sheetMode}
          user={editingUser}
          onSuccess={handleSheetSuccess}
        />
      </div>
    </div>
  )
}