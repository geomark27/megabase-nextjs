// src/types/citizen.ts

/**
 * Tipos TypeScript para el módulo de ciudadanos/contribuyentes
 * 
 * Estos tipos replican exactamente la estructura del backend Go,
 * garantizando consistencia entre frontend y backend.
 */

// ========================================
// TIPOS PRINCIPALES DE CITIZEN
// ========================================

/**
 * Citizen - Estructura principal del ciudadano/contribuyente
 * Replica exactamente el modelo del backend
 */
export interface Citizen {
  id: number

  // --- IDENTIFICACIÓN PRINCIPAL ---
  numero_identificacion: string
  tipo_identificacion: string
  
  // --- DATOS DE CONTACTO ---
  email: string
  celular: string
  convencional: string
  direccion_principal: string
  pais: string
  provincia: string
  ciudad: string

  // --- DATOS DE PERSONA NATURAL (opcionales) ---
  nombre?: string
  fecha_nacimiento?: string | Date
  nacionalidad?: string
  estado_civil?: string
  genero?: string
  
  // Campo calculado por el backend
  edad?: number

  // --- DATOS DE EMPRESA (opcionales) ---
  razon_social?: string
  nombre_comercial?: string
  tipo_empresa?: string
  representantes_legales?: any // JSON data

  // --- INFORMACIÓN TRIBUTARIA ---
  tipo_contribuyente: string
  estado_contribuyente: string
  regimen: string
  categoria: string
  obligado_contabilidad: string
  agente_retencion?: string
  contribuyente_especial?: string
  actividad_economica_principal: string
  sucursales?: any // JSON data

  // --- METADATOS ---
  motivo_cancelacion_suspension?: string
  created_at: string
  updated_at: string
}

// ========================================
// DTOS PARA FORMULARIOS
// ========================================

/**
 * CreateCitizenRequest - Para crear nuevo ciudadano
 * Replica el DTO del backend con validaciones apropiadas
 */
export interface CreateCitizenRequest {
  // --- IDENTIFICACIÓN PRINCIPAL (requerida) ---
  numero_identificacion: string
  tipo_identificacion: string
  
  // --- DATOS DE CONTACTO (requeridos) ---
  email: string
  celular: string
  convencional: string
  direccion_principal: string
  pais: string
  provincia: string
  ciudad: string

  // --- DATOS DE PERSONA NATURAL (condicionales) ---
  nombre?: string
  fecha_nacimiento?: string | Date
  nacionalidad?: string
  estado_civil?: string
  genero?: string

  // --- DATOS DE EMPRESA (condicionales) ---
  razon_social?: string
  nombre_comercial?: string
  tipo_empresa?: string
  representantes_legales?: any

  // --- INFORMACIÓN TRIBUTARIA (requerida) ---
  tipo_contribuyente: string
  estado_contribuyente: string
  regimen: string
  categoria: string
  obligado_contabilidad: string
  agente_retencion?: string
  contribuyente_especial?: string
  actividad_economica_principal: string
  sucursales?: any

  // --- METADATOS ---
  motivo_cancelacion_suspension?: string
}

/**
 * UpdateCitizenRequest - Para actualizar ciudadano existente
 * Todos los campos son opcionales excepto validaciones específicas
 */
export interface UpdateCitizenRequest {
  numero_identificacion?: string
  tipo_identificacion?: string
  email?: string
  celular?: string
  convencional?: string
  direccion_principal?: string
  pais?: string
  provincia?: string
  ciudad?: string
  nombre?: string
  fecha_nacimiento?: string | Date
  nacionalidad?: string
  estado_civil?: string
  genero?: string
  razon_social?: string
  nombre_comercial?: string
  tipo_empresa?: string
  representantes_legales?: any
  tipo_contribuyente?: string
  estado_contribuyente?: string
  regimen?: string
  categoria?: string
  obligado_contabilidad?: string
  agente_retencion?: string
  contribuyente_especial?: string
  actividad_economica_principal?: string
  sucursales?: any
  motivo_cancelacion_suspension?: string
}

// ========================================
// TIPOS PARA FILTROS Y BÚSQUEDAS
// ========================================

/**
 * CitizenSearchFilters - Filtros para búsqueda avanzada
 * Replica exactamente los filtros disponibles en el backend
 */
export interface CitizenSearchFilters {
  // Filtros principales
  tipo_identificacion?: string
  estado_contribuyente?: string
  regimen?: string
  pais?: string
  provincia?: string
  ciudad?: string
  obligado_contabilidad?: string
  
  // Filtros adicionales
  tipo_contribuyente?: string
  categoria?: string
  agente_retencion?: string
  contribuyente_especial?: string
  
  // Paginación
  page?: number
  page_size?: number
  
  // Búsqueda de texto libre
  search?: string
}

/**
 * CitizenListResponse - Respuesta del backend para listado
 */
export interface CitizenListResponse {
  success: boolean
  message: string
  data: {
    citizens: Citizen[]
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

/**
 * CitizenResponse - Respuesta del backend para operaciones individuales
 */
export interface CitizenResponse {
  success: boolean
  message: string
  data: {
    citizen: Citizen
  }
}

// ========================================
// TIPOS PARA VALIDACIONES
// ========================================

/**
 * CitizenValidationError - Errores de validación específicos
 */
export interface CitizenValidationError {
  field: string
  message: string
  code?: string
}

/**
 * AvailabilityCheckResponse - Respuesta de verificación de disponibilidad
 */
export interface AvailabilityCheckResponse {
  success: boolean
  data: {
    available: boolean
    message?: string
  }
}

// ========================================
// ENUMS Y CONSTANTES
// ========================================

/**
 * Tipos de identificación válidos en Ecuador
 */
export enum TipoIdentificacion {
  CEDULA = '05',
  RUC_PERSONA_NATURAL = '04',
  RUC_SOCIEDAD = '04',
  PASAPORTE = '06',
  CONSUMIDOR_FINAL = '07'
}

/**
 * Estados de contribuyente según SRI
 */
export enum EstadoContribuyente {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  CANCELADO = 'CANCELADO',
  INACTIVO = 'INACTIVO'
}

/**
 * Regímenes tributarios de Ecuador
 */
export enum RegimenTributario {
  GENERAL = 'REGIMEN_GENERAL',
  RIMPE_EMPRENDEDOR = 'RIMPE_EMPRENDEDOR',
  RIMPE_NEGOCIOS_POPULARES = 'RIMPE_NEGOCIOS_POPULARES',
  RIMPE_MICROEMPRESAS = 'RIMPE_MICROEMPRESAS',
  ARTESANO = 'ARTESANO'
}

/**
 * Géneros disponibles
 */
export enum Genero {
  MASCULINO = 'M',
  FEMENINO = 'F',
  OTRO = 'O'
}

/**
 * Estados civiles
 */
export enum EstadoCivil {
  SOLTERO = 'SOLTERO',
  CASADO = 'CASADO',
  DIVORCIADO = 'DIVORCIADO',
  VIUDO = 'VIUDO',
  UNION_LIBRE = 'UNION_LIBRE'
}

// ========================================
// TIPOS PARA UI COMPONENTS
// ========================================

/**
 * CitizenFormMode - Modo del formulario
 */
export type CitizenFormMode = 'create' | 'edit' | 'view'

/**
 * CitizenFormStep - Pasos del formulario multi-step
 */
export type CitizenFormStep = 'identification' | 'personal' | 'contact' | 'tax' | 'review'

/**
 * TableColumn - Configuración de columnas para la tabla
 */
export interface CitizenTableColumn {
  key: keyof Citizen
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, citizen: Citizen) => React.ReactNode
}

/**
 * FilterState - Estado de los filtros en la UI
 */
export interface CitizenFilterState {
  filters: CitizenSearchFilters
  isAdvancedMode: boolean
  activeFilterCount: number
}

// ========================================
// UTILS Y HELPERS
// ========================================

/**
 * Helper para determinar si es persona natural
 */
export const isPersonaNatural = (tipoIdentificacion: string): boolean => {
  return tipoIdentificacion === '05' || tipoIdentificacion === '06'
}

/**
 * Helper para determinar si es empresa
 */
export const isEmpresa = (tipoIdentificacion: string): boolean => {
  return tipoIdentificacion === '04'
}

/**
 * Helper para obtener el nombre display del tipo de identificación
 */
export const getTipoIdentificacionLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    '04': 'RUC',
    '05': 'Cédula de Identidad',
    '06': 'Pasaporte',
    '07': 'Consumidor Final'
  }
  return labels[tipo] || tipo
}

/**
 * Helper para validar formato de identificación ecuatoriana
 */
export const validateEcuadorianIdentification = (numero: string, tipo: string): boolean => {
  switch (tipo) {
    case '05': // Cédula
      return numero.length === 10 && /^\d+$/.test(numero)
    case '04': // RUC
      return numero.length === 13 && /^\d+$/.test(numero)
    case '06': // Pasaporte
      return numero.length >= 6 && numero.length <= 20
    default:
      return true
  }
}