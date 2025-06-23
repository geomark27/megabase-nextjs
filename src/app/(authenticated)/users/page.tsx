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
  XCircle
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
 * Página de gestión de usuarios CON SHEET Y DROPDOWN MENU
 * 
 * Mejoras en esta versión:
 * - Dropdown menu limpio para acciones
 * - Solo Editar y Eliminar (sin redundancias)
 * - Cambio de estado desde el formulario de edición
 * - UI más profesional y menos saturada
 */
export default function UsersPage() {
  // Estados para la gestión de la página
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)

  // 🔧 Estados simplificados para acciones (solo delete)
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
   * 🔧 Función simplificada para eliminar usuario
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
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-gray-600">
              Administra los usuarios del sistema, sus roles y permisos.
            </p>
          </div>
          
          {/* Botón para crear usuario */}
          <button
            onClick={openCreateSheet}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            
            {/* Filtro por rol */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los roles</option>
                <option value="1">Administrador</option>
                <option value="2">Editor</option>
                <option value="3">Viewer</option>
              </select>
            </div>

            {/* Toggle para usuarios inactivos */}
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Incluir inactivos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => {
              setError('')
              loadUsers()
            }}
            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        
        {/* Loading state */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty state */
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Intenta ajustar los filtros de búsqueda.' : 'Comienza creando tu primer usuario.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateSheet}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Usuario</span>
              </button>
            )}
          </div>
        ) : (
          /* Tabla con usuarios */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    
                    {/* Información del usuario */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">@{user.user_name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{user.role?.display_name}</div>
                          <div className="text-xs text-gray-500">{user.role?.description}</div>
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleDateString('es-ES')
                        : 'Nunca'
                      }
                    </td>

                    {/* 🆕 Acciones con Dropdown Menu limpio */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={deleteLoading[user.id]}
                          >
                            {deleteLoading[user.id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent align="end" className="w-48">
                          
                          {/* Editar usuario */}
                          <DropdownMenuItem
                            onClick={() => openEditSheet(user)}
                            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Editar usuario</span>
                          </DropdownMenuItem>

                          {/* Eliminar usuario */}
                          <DropdownMenuItem
                            onClick={() => deleteUser(user.id, user.name)}
                            disabled={user.id === currentUser?.id}
                            className="flex items-center space-x-2 text-gray-700 hover:text-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Información de la tabla */}
      {!isLoading && filteredUsers.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Mostrando {filteredUsers.length} de {users.length} usuarios
          {searchTerm && ` (filtrado por "${searchTerm}")`}
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
  )
}