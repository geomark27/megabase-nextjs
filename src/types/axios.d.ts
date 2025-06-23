// src/types/axios.d.ts

/**
 * Extensión de tipos para Axios
 * Este archivo extiende las definiciones de tipos de Axios para incluir propiedades personalizadas
 */

import 'axios'

// Declaración de módulo para extender los tipos de Axios
declare module 'axios' {
  // Extender la interfaz InternalAxiosRequestConfig para incluir nuestra propiedad metadata
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number
      duration?: number
      [key: string]: any // Permite agregar más propiedades en el futuro
    }
  }

  // También extender AxiosRequestConfig por compatibilidad
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number
      duration?: number
      [key: string]: any
    }
  }
}

/**
 * Tipos personalizados para nuestra aplicación
 * Estos tipos nos ayudan a tener mejor autocompletado y verificación de tipos
 */

// Tipo para métricas de peticiones
export interface RequestMetrics {
  startTime: number
  duration?: number
  endpoint?: string
  method?: string
  status?: number
}

// Tipo para errores de API personalizados
export interface ApiError extends Error {
  status?: number
  data?: any
  isApiError?: boolean
  isNetworkError?: boolean
}

// Tipo para la respuesta estándar de nuestra API
export interface StandardApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// Tipo para configuración extendida de peticiones
export interface ExtendedRequestConfig extends InternalAxiosRequestConfig {
  metadata?: RequestMetrics
  skipErrorHandling?: boolean // Para casos donde queremos manejar errores manualmente
  retryAttempts?: number // Para implementar retry logic en el futuro
}