// src/lib/axios.ts

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG, DEBUG_CONFIG, isDevelopment } from '@/config/api'
import type { RequestMetrics, ApiError, StandardApiResponse } from '@/types/axios'

/**
 * Instancia principal de Axios preconfigurada
 * Esta instancia incluye toda la configuración base y los interceptores
 */
const apiClient = axios.create(API_CONFIG)

/**
 * Interceptor para peticiones (request)
 * Se ejecuta antes de enviar cualquier petición al servidor
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Logging de desarrollo - solo se ejecuta si DEBUG_API está habilitado
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.logRequests) {
      console.group('🚀 API Request')
      console.log('Method:', config.method?.toUpperCase())
      console.log('URL:', config.url)
      console.log('Base URL:', config.baseURL)
      console.log('Headers:', config.headers)
      console.log('Data:', config.data)
      console.groupEnd()
    }

    // Aquí podríamos agregar automáticamente tokens de autenticación
    // si los estuviéramos manejando en localStorage o similar
    // Por ejemplo: config.headers.Authorization = `Bearer ${token}`
    
    // Agregar timestamp a la petición para métricas
    config.metadata = { startTime: Date.now() }
    
    return config
  },
  (error: AxiosError) => {
    // Manejo de errores en la configuración de la petición
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.logErrors) {
      console.error('❌ Request Configuration Error:', error)
    }
    
    return Promise.reject(error)
  }
)

/**
 * Interceptor para respuestas (response)
 * Se ejecuta después de recibir cualquier respuesta del servidor
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calcular tiempo de respuesta para métricas
    const config = response.config as InternalAxiosRequestConfig & { metadata?: { startTime: number } }
    const duration = config.metadata ? Date.now() - config.metadata.startTime : 0
    
    // Logging de desarrollo
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.logResponses) {
      console.group('✅ API Response')
      console.log('Status:', response.status, response.statusText)
      console.log('URL:', response.config.url)
      console.log('Duration:', `${duration}ms`)
      console.log('Data:', response.data)
      console.groupEnd()
    }

    // Agregar métricas a la respuesta si estamos en desarrollo
    if (isDevelopment() && config.metadata) {
      // Extraer startTime y mantener el resto de propiedades personalizadas
      const { startTime, ...otherMetadata } = config.metadata
      
      // Construir nuevo objeto metadata con duración actualizada
      response.config.metadata = {
        startTime, // Preservar el startTime original
        duration,  // Agregar la duración calculada
        ...otherMetadata // Incluir cualquier otra propiedad personalizada
      }
    }

    return response
  },
  (error: AxiosError) => {
    // Manejo centralizado de errores de respuesta
    const config = error.config as InternalAxiosRequestConfig & { metadata?: { startTime: number } }
    const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0

    // Logging de errores
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.logErrors) {
      console.group('❌ API Error')
      console.error('Status:', error.response?.status)
      console.error('URL:', error.config?.url)
      console.error('Duration:', `${duration}ms`)
      console.error('Error Data:', error.response?.data)
      console.error('Full Error:', error)
      console.groupEnd()
    }

    // Manejo específico según el tipo de error
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status
      const data = error.response.data as any

      switch (status) {
        case 401:
          // Token expirado o no válido
          console.warn('🔒 Authentication required - redirecting to login')
          // Aquí podrías disparar un evento para redirigir al login
          // o limpiar el estado de autenticación
          if (typeof window !== 'undefined') {
            // Solo ejecutar en el cliente
            window.dispatchEvent(new CustomEvent('auth:logout'))
          }
          break
          
        case 403:
          // No tiene permisos para esta acción
          console.warn('🚫 Insufficient permissions')
          break
          
        case 404:
          // Recurso no encontrado
          console.warn('🔍 Resource not found')
          break
          
        case 422:
          // Error de validación
          console.warn('📝 Validation error:', data)
          break
          
        case 500:
          // Error interno del servidor
          console.error('💥 Internal server error')
          break
          
        default:
          console.error(`🌐 HTTP Error ${status}:`, data)
      }

      // Transformar el error para que sea más fácil de manejar en los componentes
      const apiError = new Error(data?.message || `HTTP Error ${status}`)
      ;(apiError as any).status = status
      ;(apiError as any).data = data
      ;(apiError as any).isApiError = true
      
      return Promise.reject(apiError)
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('🌐 Network error - no response received')
      const networkError = new Error('Error de conexión. Verifique su conexión a internet.')
      ;(networkError as any).isNetworkError = true
      return Promise.reject(networkError)
    } else {
      // Error en la configuración de la petición
      console.error('⚙️ Request setup error:', error.message)
      return Promise.reject(error)
    }
  }
)

/**
 * Funciones helper para tipos comunes de peticiones
 * Estas funciones encapsulan los métodos HTTP más comunes
 */
export const api = {
  // GET request
  get: <T = any>(url: string, config = {}) => 
    apiClient.get<T>(url, config),
  
  // POST request
  post: <T = any>(url: string, data = {}, config = {}) => 
    apiClient.post<T>(url, data, config),
  
  // PUT request  
  put: <T = any>(url: string, data = {}, config = {}) => 
    apiClient.put<T>(url, data, config),
  
  // PATCH request
  patch: <T = any>(url: string, data = {}, config = {}) => 
    apiClient.patch<T>(url, data, config),
  
  // DELETE request
  delete: <T = any>(url: string, config = {}) => 
    apiClient.delete<T>(url, config),
}

/**
 * Cliente Axios configurado para exportar directamente
 * Úsalo cuando necesites acceso completo a la instancia de Axios
 */
export default apiClient

/**
 * Función para verificar si un error es de la API
 */
export const isApiError = (error: any): error is ApiError => {
  return error?.isApiError === true
}

/**
 * Función para verificar si un error es de red
 */
export const isNetworkError = (error: any): error is ApiError => {
  return error?.isNetworkError === true
}

/**
 * Función para extraer el mensaje de error de forma segura
 */
export const getErrorMessage = (error: any): string => {
  if (isApiError(error) || isNetworkError(error)) {
    return error.message
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.message) {
    return error.message
  }
  
  return 'Ha ocurrido un error inesperado'
}