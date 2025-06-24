// src/config/api.ts

/**
 * Configuración centralizada de la API
 * Este archivo maneja todas las URLs y configuraciones relacionadas con la API
 */

// Obtenemos las variables de entorno con valores por defecto seguros
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000')
const DEBUG_API = process.env.NEXT_PUBLIC_DEBUG_API === 'true'

/**
 * Configuración base para Axios
 * Esta configuración se aplicará a todas las peticiones
 */
export const API_CONFIG = {
    baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
    timeout: API_TIMEOUT,
    
    // Configuración para enviar y recibir cookies automáticamente
    withCredentials: true,
    
    // Headers por defecto que se enviarán en todas las peticiones
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    
    // Configuración adicional
    validateStatus: (status: number) => {
        // Consideramos exitosas las respuestas entre 200-299
        return status >= 200 && status < 300
    }
}

/**
 * Endpoints organizados por módulo
 * Esto nos permite tener todas las URLs organizadas y fáciles de mantener
 */
export const API_ENDPOINTS = {
    // Endpoints de autenticación
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
        profile: '/profile',
        checkAuth: '/check-auth',
        changePassword: '/change-password',
    },
    
    // Endpoints de usuarios
    users: {
        list: '/users',
        create: '/users',
        getById: (id: string | number) => `/users/${id}`,
        updateById: (id: string | number) => `/users/${id}`,
        deleteById: (id: string | number) => `/users/${id}`,

        // 🆕 Endpoints simples
        checkUsername: '/users/check-username',
        checkEmail: '/users/check-email',
        
        // 🆕 O con helpers (recomendado)
        checkUsernameUrl: (username: string) => `/users/check-username?username=${encodeURIComponent(username)}`,
        checkEmailUrl: (email: string) => `/users/check-email?email=${encodeURIComponent(email)}`,
    },
    
    // Endpoints de roles
    roles: {
        list: '/roles',
        create: '/roles',
        getById: (id: string | number) => `/roles/${id}`,
        updateById: (id: string | number) => `/roles/${id}`,
        deleteById: (id: string | number) => `/roles/${id}`,
    },

    // 🆕 Endpoints de ciudadanos/contribuyentes
    citizens: {
        // CRUD básico siguiendo el mismo patrón que users y roles
        list: '/citizens',
        create: '/citizens',
        getById: (id: string | number) => `/citizens/${id}`,
        updateById: (id: string | number) => `/citizens/${id}`,
        deleteById: (id: string | number) => `/citizens/${id}`,

        // Búsquedas especializadas para contribuyentes ecuatorianos
        // Estas son críticas para un sistema fiscal ya que permiten buscar por los datos únicos oficiales
        getByEmail: (email: string) => `/citizens/email/${encodeURIComponent(email)}`,
        getByIdentification: (numero: string) => `/citizens/identification/${encodeURIComponent(numero)}`,
        getByRazonSocial: (razonSocial: string) => `/citizens/razon-social/${encodeURIComponent(razonSocial)}`,

        // Verificaciones de disponibilidad para validación en tiempo real
        // Estos endpoints son perfectos para formularios interactivos que validan mientras el usuario escribe
        checkIdentificationAvailable: (numero: string) => `/citizens/check/identification/${encodeURIComponent(numero)}`,
        checkEmailAvailable: (email: string) => `/citizens/check/email/${encodeURIComponent(email)}`,
        checkRazonSocialAvailable: (razonSocial: string) => `/citizens/check/razon-social/${encodeURIComponent(razonSocial)}`,

        // Helper para construir URLs con filtros de búsqueda complejos
        // Este es especialmente útil para las funcionalidades de filtrado avanzado
        listWithFilters: (filters: {
            tipo_identificacion?: string,
            estado_contribuyente?: string,
            regimen?: string,
            pais?: string,
            provincia?: string,
            ciudad?: string,
            obligado_contabilidad?: string,
            page?: number,
            page_size?: number
        }) => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });
            const queryString = params.toString();
            return `/citizens${queryString ? `?${queryString}` : ''}`;
        }
    },
    
    // Endpoint de salud del sistema
    health: '/health',
}

/**
 * Configuración de desarrollo
 * Solo se usa cuando DEBUG_API está habilitado
 */
export const DEBUG_CONFIG = {
    enabled: DEBUG_API,
    logRequests: true,
    logResponses: true,
    logErrors: true,
}

/**
 * Función helper para construir URLs completas cuando sea necesario
 */
export const buildApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.baseURL}${endpoint}`
}

/**
 * Función para verificar si estamos en desarrollo
 */
export const isDevelopment = (): boolean => {
    return process.env.NODE_ENV === 'development'
}