// src/app/(authenticated)/citizens/page.tsx
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
  Phone,
  MapPin,
  Building2,
  User as UserIcon,
  Download,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthenticatedUser } from '../layout'
import { citizenService } from '@/services/citizenService'
import { 
  Citizen, 
  CitizenSearchFilters,
  getTipoIdentificacionLabel 
} from '@/types/citizen'

/**
 * Citizens Page - Vista principal para gestión de ciudadanos/contribuyentes
 * Diseño con estética glassmorphism consistente con users/page.tsx
 */
export default function CitizensPage() {
  const router = useRouter()
  const { user: currentUser } = useAuthenticatedUser()

  // ========================================
  // ESTADO DE LA PÁGINA
  // ========================================
  
  // Datos principales
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [totalCitizens, setTotalCitizens] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(0)
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedCitizens, setSelectedCitizens] = useState<number[]>([])
  
  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedTipoIdentificacion, setSelectedTipoIdentificacion] = useState<string>('all')
  const [selectedEstado, setSelectedEstado] = useState<string>('all')
  const [selectedProvincia, setSelectedProvincia] = useState<string>('all')

  // Estados simplificados para acciones
  const [deleteLoading, setDeleteLoading] = useState<{ [key: number]: boolean }>({})

  // ========================================
  // EFECTOS Y CARGA DE DATOS
  // ========================================

  /**
   * Cargar ciudadanos cuando cambian los filtros
   */
  useEffect(() => {
    loadCitizens()
  }, [currentPage, pageSize, selectedTipoIdentificacion, selectedEstado, selectedProvincia])

  /**
   * Función principal para cargar ciudadanos
   */
  const loadCitizens = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Preparar filtros finales
      const filters: CitizenSearchFilters = {
        page: currentPage,
        page_size: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTipoIdentificacion !== 'all' && { tipo_identificacion: selectedTipoIdentificacion }),
        ...(selectedEstado !== 'all' && { estado_contribuyente: selectedEstado }),
        ...(selectedProvincia !== 'all' && { provincia: selectedProvincia })
      }

      console.log('🔍 Cargando ciudadanos con filtros:', filters)

      const response = await citizenService.getAllCitizens(filters)

      if (response.success && response.data) {
        setCitizens(response.data.citizens || [])
        setTotalCitizens(response.data.total || 0)
        setTotalPages(response.data.total_pages || 0)
        
        console.log('✅ Ciudadanos cargados:', response.data.citizens?.length)
      } else {
        setError('No se pudieron cargar los ciudadanos')
      }
    } catch (err) {
      console.error('❌ Error cargando ciudadanos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setCitizens([])
    } finally {
      setIsLoading(false)
    }
  }

  // ========================================
  // HANDLERS DE EVENTOS
  // ========================================

  /**
   * Manejar búsqueda de texto libre
   */
  const handleSearch = () => {
    setCurrentPage(1)
    loadCitizens()
  }

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTipoIdentificacion('all')
    setSelectedEstado('all')
    setSelectedProvincia('all')
    setCurrentPage(1)
  }

  /**
   * Contar filtros activos
   */
  const getActiveFilterCount = (): number => {
    let count = 0
    if (selectedTipoIdentificacion !== 'all') count++
    if (selectedEstado !== 'all') count++
    if (selectedProvincia !== 'all') count++
    return count
  }

  /**
   * Navegar a formulario de creación
   */
  const handleCreateCitizen = () => {
    router.push('/citizens/new')
  }

  /**
   * Ver detalles de un ciudadano
   */
  const handleViewCitizen = (citizen: Citizen) => {
    router.push(`/citizens/${citizen.id}`)
  }

  /**
   * Editar un ciudadano
   */
  const handleEditCitizen = (citizen: Citizen) => {
    router.push(`/citizens/${citizen.id}/edit`)
  }

  /**
   * Eliminar un ciudadano
   */
  const deleteCitizen = async (citizenId: number, citizenName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al ciudadano "${citizenName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [citizenId]: true }))

      await citizenService.deleteCitizen(citizenId)
      setCitizens(prev => prev.filter(citizen => citizen.id !== citizenId))
      console.log(`✅ Ciudadano ${citizenName} eliminado`)
    } catch (err: any) {
      console.error('❌ Error eliminando ciudadano:', err)
      setError(`Error al eliminar ciudadano: ${err.message}`)
    } finally {
      setDeleteLoading(prev => ({ ...prev, [citizenId]: false }))
    }
  }

  /**
   * Filtrar ciudadanos basado en búsqueda
   */
  const filteredCitizens = citizens.filter(citizen => {
    if (searchTerm === '') return true
    
    const searchLower = searchTerm.toLowerCase()
    const isEmpresa = citizen.tipo_identificacion === '04'
    const displayName = isEmpresa ? citizen.razon_social : citizen.nombre
    
    return (
      citizen.numero_identificacion.toLowerCase().includes(searchLower) ||
      displayName?.toLowerCase().includes(searchLower) ||
      citizen.email.toLowerCase().includes(searchLower) ||
      (citizen.nombre_comercial && citizen.nombre_comercial.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Header elegante - Replicando estilo de users */}
        <div className="mb-8 relative">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Gestión de Ciudadanos
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Administra contribuyentes y ciudadanos del sistema fiscal ecuatoriano.
                  </p>
                </div>
              </div>
              
              {/* Botones de acción principales */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {/* TODO: Implementar exportación */}}
                  className="group relative flex items-center space-x-2 px-4 py-2 bg-background/50 border border-border/50 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg text-foreground hover:bg-accent/50"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
                
                <button
                  onClick={handleCreateCitizen}
                  className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Nuevo Ciudadano</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y filtros elegantes - Replicando estilo */}
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
                    placeholder="Buscar por identificación, nombre, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Filtros elegantes */}
              <div className="flex items-center space-x-4">
                
                {/* Filtro por tipo de identificación */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedTipoIdentificacion}
                    onChange={(e) => setSelectedTipoIdentificacion(e.target.value)}
                    className="bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="05">Cédula</option>
                    <option value="04">RUC</option>
                    <option value="06">Pasaporte</option>
                    <option value="07">Consumidor Final</option>
                  </select>
                </div>

                {/* Filtro por estado */}
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                    className="bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="SUSPENDIDO">Suspendido</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>

                {/* Toggle para filtros avanzados */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="relative flex items-center space-x-2 px-3 py-2 bg-background/50 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors text-sm text-foreground"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Avanzado</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filtros avanzados */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Filtro por provincia */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Provincia</label>
                    <select
                      value={selectedProvincia}
                      onChange={(e) => setSelectedProvincia(e.target.value)}
                      className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="all">Todas las provincias</option>
                      <option value="Azuay">Azuay</option>
                      <option value="Bolívar">Bolívar</option>
                      <option value="Cañar">Cañar</option>
                      <option value="Carchi">Carchi</option>
                      <option value="Chimborazo">Chimborazo</option>
                      <option value="Cotopaxi">Cotopaxi</option>
                      <option value="El Oro">El Oro</option>
                      <option value="Esmeraldas">Esmeraldas</option>
                      <option value="Galápagos">Galápagos</option>
                      <option value="Guayas">Guayas</option>
                      <option value="Imbabura">Imbabura</option>
                      <option value="Loja">Loja</option>
                      <option value="Los Ríos">Los Ríos</option>
                      <option value="Manabí">Manabí</option>
                      <option value="Morona Santiago">Morona Santiago</option>
                      <option value="Napo">Napo</option>
                      <option value="Orellana">Orellana</option>
                      <option value="Pastaza">Pastaza</option>
                      <option value="Pichincha">Pichincha</option>
                      <option value="Santa Elena">Santa Elena</option>
                      <option value="Santo Domingo de los Tsáchilas">Santo Domingo de los Tsáchilas</option>
                      <option value="Sucumbíos">Sucumbíos</option>
                      <option value="Tungurahua">Tungurahua</option>
                      <option value="Zamora Chinchipe">Zamora Chinchipe</option>
                    </select>
                  </div>

                  {/* Búsqueda y limpiar */}
                  <div className="flex items-end space-x-2">
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Buscar
                    </button>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                  loadCitizens()
                }}
                className="mt-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas - Replicando estilo de users */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          
          {/* Total ciudadanos */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{filteredCitizens.length}</p>
                  <p className="text-sm text-muted-foreground">Ciudadanos mostrados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ciudadanos activos */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{citizens.filter(c => c.estado_contribuyente === 'ACTIVO').length}</p>
                  <p className="text-sm text-muted-foreground">Activos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Empresas (RUCs) */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{citizens.filter(c => c.tipo_identificacion === '04').length}</p>
                  <p className="text-sm text-muted-foreground">Empresas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personas naturales */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{citizens.filter(c => c.tipo_identificacion === '05').length}</p>
                  <p className="text-sm text-muted-foreground">Personas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de ciudadanos elegante - Replicando estilo de users */}
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
                <p className="text-muted-foreground">Cargando ciudadanos...</p>
              </div>
            ) : filteredCitizens.length === 0 ? (
              /* Empty state elegante */
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron ciudadanos</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || getActiveFilterCount() > 0 
                    ? 'Intenta modificar los criterios de búsqueda o filtros.' 
                    : 'Comienza agregando el primer ciudadano al sistema.'
                  }
                </p>
                {(!searchTerm && getActiveFilterCount() === 0) && (
                  <button
                    onClick={handleCreateCitizen}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Primer Ciudadano</span>
                  </button>
                )}
              </div>
            ) : (
              /* Tabla con ciudadanos */
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Identificación
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Nombre/Razón Social
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Ubicación
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredCitizens.map((citizen) => (
                      <CitizenTableRow
                        key={citizen.id}
                        citizen={citizen}
                        onView={handleViewCitizen}
                        onEdit={handleEditCitizen}
                        onDelete={deleteCitizen}
                        deleteLoading={deleteLoading[citizen.id] || false}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Información de la tabla */}
        {!isLoading && filteredCitizens.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="text-foreground font-medium">{filteredCitizens.length}</span> de{' '}
              <span className="text-foreground font-medium">{totalCitizens.toLocaleString()}</span> ciudadanos
              {searchTerm && (
                <>
                  {' '}(filtrado por{' '}
                  <span className="text-primary font-medium">"{searchTerm}"</span>)
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ========================================
// COMPONENTE DE FILA DE TABLA
// ========================================

interface CitizenTableRowProps {
  citizen: Citizen
  onView: (citizen: Citizen) => void
  onEdit: (citizen: Citizen) => void
  onDelete: (id: number, name: string) => void
  deleteLoading: boolean
}

function CitizenTableRow({ citizen, onView, onEdit, onDelete, deleteLoading }: CitizenTableRowProps) {
  const isEmpresa = citizen.tipo_identificacion === '04'
  const displayName = isEmpresa ? citizen.razon_social : citizen.nombre

  return (
    <tr className="group hover:bg-accent/20 transition-colors">
      
      {/* Identificación */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${isEmpresa 
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20' 
            : 'bg-gradient-to-br from-green-500/20 to-emerald-600/20'
          } rounded-xl flex items-center justify-center text-sm font-medium`}>
            {isEmpresa ? (
              <Building2 className="w-5 h-5 text-blue-400" />
            ) : (
              <UserIcon className="w-5 h-5 text-green-400" />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-foreground">{citizen.numero_identificacion}</div>
            <div className="text-xs text-muted-foreground">
              {getTipoIdentificacionLabel(citizen.tipo_identificacion)}
            </div>
          </div>
        </div>
      </td>

      {/* Nombre/Razón Social */}
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-foreground">{displayName}</div>
          {isEmpresa && citizen.nombre_comercial && (
            <div className="text-xs text-muted-foreground">{citizen.nombre_comercial}</div>
          )}
        </div>
      </td>

      {/* Contacto */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground flex items-center space-x-1">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span>{citizen.email}</span>
          </div>
          {citizen.celular && (
            <div className="text-xs text-muted-foreground flex items-center space-x-1">
              <Phone className="w-3 h-3" />
              <span>{citizen.celular}</span>
            </div>
          )}
        </div>
      </td>

      {/* Ubicación */}
      <td className="px-6 py-4">
        <div className="text-sm text-foreground flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span>{citizen.ciudad}, {citizen.provincia}</span>
        </div>
      </td>

      {/* Estado */}
      <td className="px-6 py-4">
        <EstadoBadge estado={citizen.estado_contribuyente} />
      </td>

      {/* Acciones con Dropdown Menu elegante */}
      <td className="px-6 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48 bg-card/90 backdrop-blur-sm border-border/50">
            
            {/* Ver detalles */}
            <DropdownMenuItem
              onClick={() => onView(citizen)}
              className="flex items-center space-x-2 text-foreground hover:text-primary cursor-pointer hover:bg-accent/50"
            >
              <Eye className="w-4 h-4" />
              <span>Ver detalles</span>
            </DropdownMenuItem>

            {/* Editar ciudadano */}
            <DropdownMenuItem
              onClick={() => onEdit(citizen)}
              className="flex items-center space-x-2 text-foreground hover:text-primary cursor-pointer hover:bg-accent/50"
            >
              <Edit className="w-4 h-4" />
              <span>Editar ciudadano</span>
            </DropdownMenuItem>

            {/* Eliminar ciudadano */}
            <DropdownMenuItem
              onClick={() => onDelete(citizen.id, displayName || `${citizen.numero_identificacion}`)}
              className="flex items-center space-x-2 text-foreground hover:text-red-400 cursor-pointer hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar ciudadano</span>
            </DropdownMenuItem>
            
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

// ========================================
// COMPONENTE DE BADGE DE ESTADO
// ========================================

function EstadoBadge({ estado }: { estado: string }) {
  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return {
          className: 'bg-green-500/20 text-green-400 border border-green-500/30',
          icon: CheckCircle
        }
      case 'SUSPENDIDO':
        return {
          className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
          icon: XCircle
        }
      case 'CANCELADO':
        return {
          className: 'bg-red-500/20 text-red-400 border border-red-500/30',
          icon: XCircle
        }
      default:
        return {
          className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
          icon: XCircle
        }
    }
  }

  const config = getEstadoConfig(estado)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {estado}
    </span>
  )
}