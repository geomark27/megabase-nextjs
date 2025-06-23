// src/services/authService.ts

import { api } from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'

/**
 * Tipos de datos para las peticiones y respuestas de autenticación
 * Estos tipos nos dan autocompletado y verificación de tipos en TypeScript
 */

// Datos para el login
export interface LoginRequest {
  user_name: string
  password: string
}

// Datos para el registro
export interface RegisterRequest {
  name: string
  user_name: string
  email: string
  password: string
  role_id: number
}

// Datos para cambio de contraseña
export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// Información del usuario
export interface User {
  id: number
  name: string
  user_name: string
  email: string
  role_id: number
  role: {
    id: number
    name: string
    display_name: string
    description: string
  }
  is_active: boolean
  last_login_at: string
  created_at: string
  updated_at: string
}

// Respuesta de autenticación exitosa
export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
  }
}

// Respuesta genérica de la API
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

/**
 * Servicio de autenticación
 * Este servicio maneja todas las operaciones relacionadas con autenticación
 */
export class AuthService {
  
  /**
   * Iniciar sesión
   * Envía las credenciales al backend y maneja la respuesta
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.login,
        credentials
      )
      
      // Las cookies se establecen automáticamente gracias a withCredentials: true
      // No necesitamos manejar manualmente los tokens
      
      return response.data
    } catch (error) {
      // El interceptor de Axios ya transformó el error
      throw error
    }
  }

  /**
   * Registrar nuevo usuario
   * Crea una nueva cuenta de usuario
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.register,
        userData
      )
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Cerrar sesión
   * Limpia las cookies de autenticación en el servidor
   */
  async logout(): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>(
        API_ENDPOINTS.auth.logout
      )
      
      return response.data
    } catch (error) {
      // Incluso si hay un error, limpiamos el estado local
      this.clearLocalAuthState()
      throw error
    }
  }

  /**
   * Refrescar token de acceso
   * Usa el refresh token para obtener un nuevo access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.refresh
      )
      
      return response.data
    } catch (error) {
      // Si no se puede refrescar, probablemente el refresh token expiró
      this.clearLocalAuthState()
      throw error
    }
  }

  /**
   * Obtener perfil del usuario actual
   * Recupera la información del usuario autenticado
   */
  async getProfile(): Promise<{ user: User }> {
    try {
      const response = await api.get<{ data: { user: User } }>(
        API_ENDPOINTS.auth.profile
      )
      
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * Hace una petición al backend para verificar el estado de autenticación
   */
  async checkAuth(): Promise<{ authenticated: boolean; user?: User }> {
    try {
      const response = await api.get<{ 
        data: { 
          authenticated: boolean
          user?: User 
        } 
      }>(API_ENDPOINTS.auth.checkAuth)
      
      return response.data.data
    } catch (error) {
      // Si hay error, asumimos que no está autenticado
      return { authenticated: false }
    }
  }

  /**
   * Cambiar contraseña
   * Permite al usuario cambiar su contraseña actual
   */
  async changePassword(passwords: ChangePasswordRequest): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>(
        API_ENDPOINTS.auth.changePassword,
        passwords
      )
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Limpiar estado de autenticación local
   * Esta función se llama cuando hay errores de autenticación
   * o cuando el usuario hace logout
   */
  private clearLocalAuthState(): void {
    // Aquí podrías limpiar cualquier estado local relacionado con autenticación
    // Por ejemplo, si estuvieras usando localStorage para algún estado:
    // localStorage.removeItem('user')
    
    // Disparar evento personalizado para que otros componentes puedan reaccionar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
  }

  /**
   * Función helper para manejar redirecciones después del login
   */
  handleLoginSuccess(redirectTo: string = '/dashboard'): void {
    if (typeof window !== 'undefined') {
      // Disparar evento de login exitoso
      window.dispatchEvent(new CustomEvent('auth:login'))
      
      // Redirigir al dashboard o página especificada
      window.location.href = redirectTo
    }
  }

  /**
   * Función helper para manejar errores de autenticación
   */
  handleAuthError(error: any): string {
    // Si es un error de validación (422), mostrar detalles específicos
    if (error.status === 422 && error.data?.errors) {
      const validationErrors = Object.values(error.data.errors).flat()
      return validationErrors.join(', ')
    }
    
    // Para otros errores, mostrar el mensaje general
    return error.message || 'Error de autenticación'
  }
}

/**
 * Instancia singleton del servicio de autenticación
 * Exportamos una instancia única para usar en toda la aplicación
 */
export const authService = new AuthService()

/**
 * Hook personalizado para manejar el estado de autenticación
 * Este es un patrón común en React para encapsular lógica relacionada
 */
export const useAuthState = () => {
  // Este hook se puede expandir más tarde para manejar estado reactivo
  // Por ahora, solo proporciona acceso al servicio
  return {
    authService,
    // Aquí podrías agregar estado reactivo usando useState, useEffect, etc.
  }
}