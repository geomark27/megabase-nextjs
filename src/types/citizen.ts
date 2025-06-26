// src/types/citizen.ts

/**
 * Tipos TypeScript para el módulo de ciudadanos/contribuyentes
 * ✅ CORREGIDO: Estructura de respuesta de listado basada en el backend real
 */

// ========================================
// TIPOS PRINCIPALES DE CITIZEN
// ========================================

export interface Citizen {
  id: number
  numero_identificacion: string
  tipo_identificacion: string
  email: string
  celular: string
  convencional: string
  direccion_principal: string
  pais: string
  provincia: string
  ciudad: string
  nombre?: string
  fecha_nacimiento?: string | Date
  nacionalidad?: string
  estado_civil?: string
  genero?: string
  edad?: number
  razon_social?: string
  nombre_comercial?: string
  tipo_empresa?: string
  representantes_legales?: any
  tipo_contribuyente: string
  estado_contribuyente: string
  regimen: string
  categoria: string
  obligado_contabilidad: string
  agente_retencion?: string
  contribuyente_especial?: string
  actividad_economica_principal: string
  sucursales?: any
  motivo_cancelacion_suspension?: string
  created_at: string
  updated_at: string
}

// ========================================
// DTOS PARA FORMULARIOS
// ========================================

export interface CreateCitizenRequest {
  numero_identificacion: string
  tipo_identificacion: string
  email: string
  celular: string
  convencional: string
  direccion_principal: string
  pais: string
  provincia: string
  ciudad: string
  nombre?: string
  fecha_nacimiento?: string | Date
  nacionalidad?: string
  estado_civil?: string
  genero?: string
  razon_social?: string
  nombre_comercial?: string
  tipo_empresa?: string
  representantes_legales?: any
  tipo_contribuyente: string
  estado_contribuyente: string
  regimen: string
  categoria: string
  obligado_contabilidad: string
  agente_retencion?: string
  contribuyente_especial?: string
  actividad_economica_principal: string
  sucursales?: any
  motivo_cancelacion_suspension?: string
}

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

export interface CitizenSearchFilters {
  tipo_identificacion?: string
  estado_contribuyente?: string
  regimen?: string
  pais?: string
  provincia?: string
  ciudad?: string
  obligado_contabilidad?: string
  tipo_contribuyente?: string
  categoria?: string
  agente_retencion?: string
  contribuyente_especial?: string
  page?: number
  page_size?: number
  search?: string
}

/**
 * ✅ CORREGIDO: Estructura de respuesta de listado basada en el backend Go real
 * El backend devuelve: { success: boolean, data: Citizen[], count: number, filters: any }
 */
export interface CitizenListResponse {
  success: boolean
  message?: string
  data: Citizen[]        // ✅ Array directo de ciudadanos
  count: number          // ✅ Total de registros  
  filters?: CitizenSearchFilters
}

/**
 * CitizenResponse - Para operaciones individuales (crear, actualizar, obtener uno)
 */
export interface CitizenResponse {
  success: boolean
  message: string
  data: Citizen  // Citizen individual
}

// ========================================
// TIPOS PARA VALIDACIONES DE DISPONIBILIDAD  
// ========================================

export interface IdentificationAvailabilityResponse {
  available: boolean
  numero: string
  error?: string
  message?: string
}

export interface EmailAvailabilityResponse {
  available: boolean
  email: string
  error?: string
  message?: string
}

export interface RazonSocialAvailabilityResponse {
  available: boolean
  razon_social: string
  error?: string
  message?: string
}

export interface CitizenValidationError {
  field: string
  message: string
  code?: string
}

// ========================================
// ENUMS Y CONSTANTES
// ========================================

export enum TipoIdentificacion {
  CEDULA = '05',
  RUC_PERSONA_NATURAL = '04',
  RUC_SOCIEDAD = '04',
  PASAPORTE = '06',
  CONSUMIDOR_FINAL = '07'
}

export enum EstadoContribuyente {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  CANCELADO = 'CANCELADO',
  INACTIVO = 'INACTIVO'
}

export enum RegimenTributario {
  GENERAL = 'REGIMEN_GENERAL',
  RIMPE_EMPRENDEDOR = 'RIMPE_EMPRENDEDOR',
  RIMPE_NEGOCIOS_POPULARES = 'RIMPE_NEGOCIOS_POPULARES',
  RIMPE_MICROEMPRESAS = 'RIMPE_MICROEMPRESAS',
  ARTESANO = 'ARTESANO'
}

export enum Genero {
  MASCULINO = 'M',
  FEMENINO = 'F',
  OTRO = 'O'
}

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

export type CitizenFormMode = 'create' | 'edit' | 'view'
export type CitizenFormStep = 'identification' | 'personal' | 'contact' | 'tax' | 'review'

export interface CitizenTableColumn {
  key: keyof Citizen
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, citizen: Citizen) => React.ReactNode
}

export interface CitizenFilterState {
  filters: CitizenSearchFilters
  isAdvancedMode: boolean
  activeFilterCount: number
}

// ========================================
// UTILS Y HELPERS
// ========================================

export const isPersonaNatural = (tipoIdentificacion: string): boolean => {
  return tipoIdentificacion === '05' || tipoIdentificacion === '06'
}

export const isEmpresa = (tipoIdentificacion: string): boolean => {
  return tipoIdentificacion === '04'
}

export const getTipoIdentificacionLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    '04': 'RUC',
    '05': 'Cédula de Identidad',
    '06': 'Pasaporte',
    '07': 'Consumidor Final'
  }
  return labels[tipo] || tipo
}

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