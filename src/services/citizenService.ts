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
  AvailabilityCheckResponse
} from '@/types/citizen'

/**
 * CitizenService - Servicio completo para gestión de ciudadanos/contribuyentes
 * 
 * Este servicio actúa como el "traductor" entre tu interfaz React y el backend Go.
 * Encapsula toda la complejidad de las comunicaciones HTTP y proporciona una
 * API simple y TypeScript-friendly para los componentes.
 * 
 * Piensa en este servicio como el "gerente de comunicaciones" de tu aplicación.
 */

class CitizenService {
  
  // ========================================
  // OPERACIONES CRUD BÁSICAS
  // ========================================
  
  /**
   * Obtener lista de ciudadanos con filtros opcionales
   * 
   * Este método es como el "buscador Google" de tu sistema de contribuyentes.
   * Puedes combinar múltiples filtros para encontrar exactamente lo que necesitas.
   * 
   * @param filters - Filtros opcionales para la búsqueda
   * @returns Promise con la lista de ciudadanos y metadatos de paginación
   */
  async getAllCitizens(filters?: CitizenSearchFilters): Promise<CitizenListResponse> {
    try {
      // Construir la URL con filtros usando nuestro helper inteligente
      const endpoint = filters 
        ? API_ENDPOINTS.citizens.listWithFilters(filters)
        : API_ENDPOINTS.citizens.list
      
      console.log('🔍 Buscando ciudadanos con filtros:', filters)
      console.log('🌐 URL generada:', endpoint)
      
      const response = await api.get(endpoint)
      
      console.log('✅ Ciudadanos obtenidos:', response.data.data?.citizens?.length || 0)
      
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo ciudadanos:', error)
      throw this.handleApiError(error, 'Error al obtener la lista de ciudadanos')
    }
  }

  /**
   * Obtener un ciudadano específico por ID
   * 
   * @param id - ID del ciudadano
   * @returns Promise con los datos del ciudadano
   */
  async getCitizenById(id: string | number): Promise<CitizenResponse> {
    try {
      console.log('🔍 Obteniendo ciudadano con ID:', id)
      
      const response = await api.get(API_ENDPOINTS.citizens.getById(id))
      
      console.log('✅ Ciudadano obtenido:', response.data.data?.citizen?.numero_identificacion)
      
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo ciudadano por ID:', error)
      throw this.handleApiError(error, `Error al obtener el ciudadano con ID ${id}`)
    }
  }

  /**
   * Crear un nuevo ciudadano
   * 
   * Este método incluye validaciones automáticas y manejo inteligente de errores.
   * Si hay errores de validación, los convierte en un formato fácil de usar
   * en los formularios React.
   * 
   * @param citizenData - Datos del nuevo ciudadano
   * @returns Promise con el ciudadano creado
   */
  async createCitizen(citizenData: CreateCitizenRequest): Promise<CitizenResponse> {
    try {
      console.log('🆕 Creando nuevo ciudadano:', citizenData.numero_identificacion)
      
      // Limpiar y preparar los datos antes de enviarlos
      const cleanedData = this.prepareCitizenData(citizenData)
      
      const response = await api.post(API_ENDPOINTS.citizens.create, cleanedData)
      
      console.log('✅ Ciudadano creado exitosamente:', response.data.data?.citizen?.id)
      
      return response.data
    } catch (error) {
      console.error('❌ Error creando ciudadano:', error)
      throw this.handleApiError(error, 'Error al crear el ciudadano')
    }
  }

  /**
   * Actualizar un ciudadano existente
   * 
   * @param id - ID del ciudadano a actualizar
   * @param updateData - Datos a actualizar (solo los campos modificados)
   * @returns Promise con el ciudadano actualizado
   */
  async updateCitizen(id: string | number, updateData: UpdateCitizenRequest): Promise<CitizenResponse> {
    try {
      console.log('🔄 Actualizando ciudadano:', id)
      
      // Limpiar y preparar los datos de actualización
      const cleanedData = this.prepareCitizenData(updateData)
      
      const response = await api.put(API_ENDPOINTS.citizens.updateById(id), cleanedData)
      
      console.log('✅ Ciudadano actualizado exitosamente')
      
      return response.data
    } catch (error) {
      console.error('❌ Error actualizando ciudadano:', error)
      throw this.handleApiError(error, `Error al actualizar el ciudadano con ID ${id}`)
    }
  }

  /**
   * Eliminar un ciudadano
   * 
   * @param id - ID del ciudadano a eliminar
   * @returns Promise con confirmación de eliminación
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

  /**
   * Buscar ciudadano por número de identificación
   * 
   * Este es probablemente el método más usado en un sistema fiscal.
   * Permite buscar por cédula, RUC, pasaporte, etc.
   * 
   * @param numero - Número de identificación (cédula, RUC, pasaporte)
   * @returns Promise con el ciudadano encontrado o null
   */
  async getCitizenByIdentification(numero: string): Promise<CitizenResponse | null> {
    try {
      console.log('🔍 Buscando por identificación:', numero)
      
      const response = await api.get(API_ENDPOINTS.citizens.getByIdentification(numero))
      
      console.log('✅ Ciudadano encontrado por identificación')
      
      return response.data
    } catch (error) {
      // Si es 404, significa que no existe (esto es normal)
      if (this.isNotFoundError(error)) {
        console.log('ℹ️ No se encontró ciudadano con identificación:', numero)
        return null
      }
      
      console.error('❌ Error buscando por identificación:', error)
      throw this.handleApiError(error, `Error al buscar ciudadano con identificación ${numero}`)
    }
  }

  /**
   * Buscar ciudadano por email
   * 
   * @param email - Email del ciudadano
   * @returns Promise con el ciudadano encontrado o null
   */
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

  /**
   * Buscar ciudadano por razón social
   * 
   * @param razonSocial - Razón social de la empresa
   * @returns Promise con el ciudadano encontrado o null
   */
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

  /**
   * Verificar si un número de identificación está disponible
   * 
   * Perfecto para validación en tiempo real mientras el usuario escribe.
   * Evita errores de duplicación antes de que sucedan.
   * 
   * @param numero - Número de identificación a verificar
   * @returns Promise con el resultado de disponibilidad
   */
  async checkIdentificationAvailability(numero: string): Promise<AvailabilityCheckResponse> {
    try {
      
      const response = await api.get(API_ENDPOINTS.citizens.checkIdentificationAvailable(numero)) 
      return response.data
    } catch (error) {
      console.error('❌ Error verificando disponibilidad de identificación:', error)
      // En caso de error, asumimos que no está disponible por seguridad
      return {
        success: false,
        data: {
          available: false,
          message: 'Error al verificar disponibilidad'
        }
      }
    }
  }

  /**
   * Verificar si un email está disponible
   * 
   * @param email - Email a verificar
   * @returns Promise con el resultado de disponibilidad
   */
  async checkEmailAvailability(email: string): Promise<AvailabilityCheckResponse> {
    try {
      console.log('🔍 Verificando disponibilidad de email:', email)
      
      const response = await api.get(API_ENDPOINTS.citizens.checkEmailAvailable(email))
      
      const available = response.data.data?.available || false
      console.log('✅ Email disponible:', available)
      
      return response.data
    } catch (error) {
      console.error('❌ Error verificando disponibilidad de email:', error)
      return {
        success: false,
        data: {
          available: false,
          message: 'Error al verificar disponibilidad'
        }
      }
    }
  }

  /**
   * Verificar si una razón social está disponible
   * 
   * @param razonSocial - Razón social a verificar
   * @returns Promise con el resultado de disponibilidad
   */
  async checkRazonSocialAvailability(razonSocial: string): Promise<AvailabilityCheckResponse> {
    try {
      console.log('🔍 Verificando disponibilidad de razón social:', razonSocial)
      
      const response = await api.get(API_ENDPOINTS.citizens.checkRazonSocialAvailable(razonSocial))
      
      const available = response.data.data?.available || false
      console.log('✅ Razón social disponible:', available)
      
      return response.data
    } catch (error) {
      console.error('❌ Error verificando disponibilidad de razón social:', error)
      return {
        success: false,
        data: {
          available: false,
          message: 'Error al verificar disponibilidad'
        }
      }
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ========================================

  /**
   * Prepara y limpia los datos antes de enviarlos al backend
   * 
   * Este método es importante porque asegura que los datos estén en el formato
   * correcto que espera el backend Go. Elimina campos vacíos, convierte fechas,
   * y normaliza strings.
   */
  private prepareCitizenData(data: CreateCitizenRequest | UpdateCitizenRequest): any {
    // Crear una copia para no modificar el objeto original
    const cleanedData = { ...data }

    // Limpiar strings vacíos (convertir a null para campos opcionales)
    Object.keys(cleanedData).forEach(key => {
      const value = (cleanedData as any)[key]
      
      // Si es string vacío, convertir a null para campos opcionales
      if (typeof value === 'string' && value.trim() === '') {
        if (this.isOptionalField(key)) {
          (cleanedData as any)[key] = null
        }
      }
      
      // Limpiar espacios en blanco de strings
      if (typeof value === 'string') {
        (cleanedData as any)[key] = value.trim()
      }
    })

    // Convertir fechas al formato que espera el backend
    if (cleanedData.fecha_nacimiento) {
      if (cleanedData.fecha_nacimiento instanceof Date) {
        cleanedData.fecha_nacimiento = cleanedData.fecha_nacimiento.toISOString().split('T')[0]
      }
    }

    return cleanedData
  }

  /**
   * Determina si un campo es opcional según el tipo de contribuyente
   */
  private isOptionalField(fieldName: string): boolean {
    const optionalFields = [
      'nombre', 'fecha_nacimiento', 'nacionalidad', 'estado_civil', 'genero',
      'razon_social', 'nombre_comercial', 'tipo_empresa', 'representantes_legales',
      'agente_retencion', 'contribuyente_especial', 'motivo_cancelacion_suspension'
    ]
    
    return optionalFields.includes(fieldName)
  }

  /**
   * Maneja errores de la API de manera consistente
   */
  private handleApiError(error: any, defaultMessage: string): Error {
    // Si el backend envió un mensaje de error específico
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    
    // Si hay detalles adicionales del error
    if (error.response?.data?.details) {
      return new Error(`${defaultMessage}: ${error.response.data.details}`)
    }
    
    // Error de red o servidor no disponible
    if (!error.response) {
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
    }
    
    // Error genérico
    return new Error(defaultMessage)
  }

  /**
   * Verifica si un error es de tipo "no encontrado" (404)
   */
  private isNotFoundError(error: any): boolean {
    return error.response?.status === 404
  }
}

// Crear y exportar una instancia singleton del servicio
export const citizenService = new CitizenService()

// También exportar la clase para casos especiales
export default CitizenService