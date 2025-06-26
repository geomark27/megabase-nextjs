// src/services/citizenService.ts

import { api } from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'
import { 
  Citizen, 
  CreateCitizenRequest, 
  UpdateCitizenRequest,
  CitizenSearchFilters,
  CitizenListResponse,
  CitizenResponse,
  IdentificationAvailabilityResponse,
  EmailAvailabilityResponse,
  RazonSocialAvailabilityResponse,
} from '@/types/citizen'

/**
 * CitizenService - Servicio completo para gestión de ciudadanos/contribuyentes
 * ✅ CORREGIDO: Manejo consistente de respuestas del backend
 */
class CitizenService {
  
  // ========================================
  // OPERACIONES CRUD BÁSICAS
  // ========================================
  
  /**
   * Obtener lista de ciudadanos con filtros opcionales
   * ✅ CORREGIDO: Acceso correcto a la estructura de respuesta
   */
  async getAllCitizens(filters?: CitizenSearchFilters): Promise<CitizenListResponse> {
    try {
      const endpoint = filters 
        ? API_ENDPOINTS.citizens.listWithFilters(filters)
        : API_ENDPOINTS.citizens.list
      
      console.log('🔍 Buscando ciudadanos con filtros:', filters)
      console.log('🌐 URL generada:', endpoint)
      
      const response = await api.get(endpoint)
      
      // ✅ CORREGIDO: Estructura de respuesta del backend Go
      // Backend devuelve: { success: true, data: [...], count: 123, filters: {...} }
      console.log('📋 Respuesta completa del backend:', response.data)
      
      // Construir respuesta normalizada
      const normalizedResponse: CitizenListResponse = {
        success: response.data.success || true,
        message: response.data.message,
        data: response.data.data || [],           // Array de ciudadanos
        count: response.data.count || 0,          // Total de registros
        filters: response.data.filters
      }
      
      console.log('✅ Ciudadanos obtenidos:', normalizedResponse.data.length)
      console.log('📊 Total en BD:', normalizedResponse.count)
      
      return normalizedResponse
    } catch (error) {
      console.error('❌ Error obteniendo ciudadanos:', error)
      throw this.handleApiError(error, 'Error al obtener la lista de ciudadanos')
    }
  }

  /**
   * Obtener un ciudadano específico por ID
   */
  async getCitizenById(id: string | number): Promise<CitizenResponse> {
    try {
      console.log('🔍 Obteniendo ciudadano con ID:', id)
      
      const response = await api.get(API_ENDPOINTS.citizens.getById(id))
      
      console.log('✅ Ciudadano obtenido:', response.data.data?.numero_identificacion)
      
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo ciudadano por ID:', error)
      throw this.handleApiError(error, `Error al obtener el ciudadano con ID ${id}`)
    }
  }

  /**
   * Crear un nuevo ciudadano
   */
  async createCitizen(citizenData: CreateCitizenRequest): Promise<CitizenResponse> {
    try {
      console.log('🆕 Creando nuevo ciudadano:', citizenData.numero_identificacion)
      
      const cleanedData = this.prepareCitizenData(citizenData)
      
      console.log('📤 Payload final a enviar:', JSON.stringify(cleanedData, null, 2))
      
      const response = await api.post(API_ENDPOINTS.citizens.create, cleanedData)
      
      console.log('✅ Ciudadano creado exitosamente:', response.data.data?.id)
      
      return response.data
    } catch (error) {
      console.error('❌ Error creando ciudadano:', error)
      throw this.handleApiError(error, 'Error al crear el ciudadano')
    }
  }

  /**
   * Actualizar un ciudadano existente
   */
  async updateCitizen(id: string | number, updateData: UpdateCitizenRequest): Promise<CitizenResponse> {
    try {
      console.log('🔄 Actualizando ciudadano:', id)
      
      const cleanedData = this.prepareCitizenData(updateData)
      
      const response = await api.put(API_ENDPOINTS.citizens.updateById(id), cleanedData)
      
      console.log('✅ Ciudadano actualizado exitosamente:', response.data.data?.id)
      
      return response.data
    } catch (error) {
      console.error('❌ Error actualizando ciudadano:', error)
      throw this.handleApiError(error, `Error al actualizar el ciudadano con ID ${id}`)
    }
  }

  /**
   * Eliminar un ciudadano
   */
  async deleteCitizen(id: string | number): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ Eliminando ciudadano:', id)
      
      const response = await api.delete(API_ENDPOINTS.citizens.deleteById(id))
      
      console.log('✅ Ciudadano eliminado exitosamente')
      
      return response.data
    } catch (error) {
      console.error('❌ Error eliminando ciudadano:', error)
      throw this.handleApiError(error, `Error al eliminar el ciudadano con ID ${id}`)
    }
  }

  // ========================================
  // BÚSQUEDAS ESPECIALIZADAS
  // ========================================

  async getCitizenByIdentification(numero: string): Promise<CitizenResponse | null> {
    try {
      console.log('🔍 Buscando por identificación:', numero)
      
      const response = await api.get(API_ENDPOINTS.citizens.getByIdentification(numero))
      
      console.log('✅ Ciudadano encontrado por identificación')
      
      return response.data
    } catch (error) {
      if (this.isNotFoundError(error)) {
        console.log('ℹ️ No se encontró ciudadano con identificación:', numero)
        return null
      }
      
      console.error('❌ Error buscando por identificación:', error)
      throw this.handleApiError(error, `Error al buscar ciudadano con identificación ${numero}`)
    }
  }

  async getCitizenByEmail(email: string): Promise<CitizenResponse | null> {
    try {
      console.log('🔍 Buscando por email:', email)
      
      const response = await api.get(API_ENDPOINTS.citizens.getByEmail(email))
      
      console.log('✅ Ciudadano encontrado por email')
      
      return response.data
    } catch (error) {
      if (this.isNotFoundError(error)) {
        console.log('ℹ️ No se encontró ciudadano con email:', email)
        return null
      }
      
      console.error('❌ Error buscando por email:', error)
      throw this.handleApiError(error, `Error al buscar ciudadano con email ${email}`)
    }
  }

  async getCitizenByRazonSocial(razonSocial: string): Promise<CitizenResponse | null> {
    try {
      console.log('🔍 Buscando por razón social:', razonSocial)
      
      const response = await api.get(API_ENDPOINTS.citizens.getByRazonSocial(razonSocial))
      
      console.log('✅ Ciudadano encontrado por razón social')
      
      return response.data
    } catch (error) {
      if (this.isNotFoundError(error)) {
        console.log('ℹ️ No se encontró ciudadano con razón social:', razonSocial)
        return null
      }
      
      console.error('❌ Error buscando por razón social:', error)
      throw this.handleApiError(error, `Error al buscar ciudadano con razón social ${razonSocial}`)
    }
  }

  // ========================================
  // VERIFICACIONES DE DISPONIBILIDAD
  // ========================================
  
  async checkIdentificationAvailability(numero: string): Promise<IdentificationAvailabilityResponse> {
    try {
      const response = await api.get(API_ENDPOINTS.citizens.checkIdentificationAvailable(numero))
      return response.data
    } catch (error) {
      console.error('❌ Error verificando disponibilidad de identificación:', error)
      return {
        available: false,
        numero: numero,
        error: 'Error al verificar disponibilidad'
      }
    }
  }

  async checkEmailAvailability(email: string): Promise<EmailAvailabilityResponse> {
    try {      
      const response = await api.get(API_ENDPOINTS.citizens.checkEmailAvailable(email))
      return response.data
    } catch (error) {
      console.error('❌ Error verificando disponibilidad de email:', error)
      return {
        available: false,
        email: email,
        error: 'Error al verificar disponibilidad'
      }
    }
  }

  async checkRazonSocialAvailability(razonSocial: string): Promise<RazonSocialAvailabilityResponse> {
    try {
      console.log('🔍 Verificando disponibilidad de razón social:', razonSocial)
      
      const response = await api.get(API_ENDPOINTS.citizens.checkRazonSocialAvailable(razonSocial))
      return response.data
    } catch (error) {
      console.error('❌ Error verificando disponibilidad de razón social:', error)
      return {
        available: false,
        razon_social: razonSocial,
        error: 'Error al verificar disponibilidad'
      }
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ========================================

  /**
   * Prepara y limpia los datos antes de enviarlos al backend
   */
  private prepareCitizenData(data: CreateCitizenRequest | UpdateCitizenRequest): any {
    const cleanedData = { ...data }

    Object.keys(cleanedData).forEach(key => {
      const value = (cleanedData as any)[key]
      
      if (typeof value === 'string' && value.trim() === '') {
        if (this.isOptionalField(key)) {
          (cleanedData as any)[key] = null
        }
      }
      
      if (typeof value === 'string') {
        (cleanedData as any)[key] = value.trim()
      }
    })

    // Manejo de fechas
    if (cleanedData.fecha_nacimiento) {
      if (cleanedData.fecha_nacimiento instanceof Date) {
        cleanedData.fecha_nacimiento = cleanedData.fecha_nacimiento.toISOString()
      } else if (typeof cleanedData.fecha_nacimiento === 'string') {
        try {
          const date = new Date(cleanedData.fecha_nacimiento)
          if (!isNaN(date.getTime())) {
            date.setUTCHours(12, 0, 0, 0)
            cleanedData.fecha_nacimiento = date.toISOString()
          }
        } catch (error) {
          console.warn('Error parseando fecha:', cleanedData.fecha_nacimiento)
          cleanedData.fecha_nacimiento = ''
        }
      }
    }

    if (!cleanedData.fecha_nacimiento) {
      cleanedData.fecha_nacimiento = ''
    }

    return cleanedData
  }

  private isOptionalField(fieldName: string): boolean {
    const optionalFields = [
      'nombre', 'fecha_nacimiento', 'nacionalidad', 'estado_civil', 'genero',
      'razon_social', 'nombre_comercial', 'tipo_empresa', 'representantes_legales',
      'agente_retencion', 'contribuyente_especial', 'motivo_cancelacion_suspension',
      'convencional'
    ]
    
    return optionalFields.includes(fieldName)
  }

  private handleApiError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    
    if (error.response?.data?.details) {
      return new Error(`${error.response.data.details}`)
    }
    
    if (error.response?.data?.error && error.response?.status === 400) {
      return new Error(error.response.data.error)
    }
    
    if (!error.response) {
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
    }
    
    switch (error.response?.status) {
      case 400:
        return new Error('Datos inválidos. Verifica la información enviada.')
      case 401:
        return new Error('No tienes permisos para realizar esta acción.')
      case 404:
        return new Error('El recurso solicitado no fue encontrado.')
      case 409:
        return new Error('Ya existe un registro con estos datos.')
      case 500:
        return new Error('Error interno del servidor. Intenta nuevamente.')
      default:
        return new Error(defaultMessage)
    }
  }

  private isNotFoundError(error: any): boolean {
    return error.response?.status === 404
  }
}

export const citizenService = new CitizenService()
export default CitizenService