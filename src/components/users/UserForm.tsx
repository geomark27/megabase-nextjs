'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Shield, Mail, User, Lock, Save, X } from 'lucide-react'
import { api } from '@/lib/axios'
import { getErrorMessage } from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'

/**
 * Tipos para el formulario
 */
interface UserFormData {
  name: string
  user_name: string
  email: string
  password: string
  confirmPassword: string
  role_id: number | ''
  is_active: boolean
}

interface Role {
  id: number
  name: string
  display_name: string
  description: string
  is_active: boolean
}

interface User {
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
}

interface UserFormProps {
  mode: 'create' | 'edit'
  user?: User | null
  onSuccess: () => void
  onCancel: () => void
}

/**
 * UserForm Component
 * 
 * Formulario reutilizable para crear y editar usuarios
 * - Maneja create y edit en el mismo componente
 * - Validación en tiempo real
 * - Verificación de disponibilidad de username/email
 * - Indicadores visuales de estado
 */
export function UserForm({ mode, user, onSuccess, onCancel }: UserFormProps) {
  
  // Estados del formulario
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    user_name: user?.user_name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role_id: user?.role_id || '',
    is_active: user?.is_active ?? true
  })

  // Estados de la UI
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)

  // Estados para validaciones en tiempo real
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  /**
   * Cargar roles al montar el componente
   */
  useEffect(() => {
    loadRoles()
  }, [])

  /**
   * Si es modo edit, validar disponibilidad solo si cambian los valores originales
   */
  useEffect(() => {
    if (mode === 'edit' && user) {
      // Si el username no cambió, marcarlo como disponible
      if (formData.user_name === user.user_name) {
        setUsernameAvailable(true)
      }
      // Si el email no cambió, marcarlo como disponible  
      if (formData.email === user.email) {
        setEmailAvailable(true)
      }
    }
  }, [mode, user, formData.user_name, formData.email])

  /**
   * Cargar roles desde la API
   */
  const loadRoles = async () => {
    try {
      setIsLoadingRoles(true)
      const response = await api.get('/roles')
      
      if (response.data.status === 'success') {
        const rolesData = response.data.data
        const rolesList = rolesData?.roles || []
        const activeRoles = rolesList.filter((role: Role) => role.is_active)
        setRoles(activeRoles)
      } else {
        setErrors(prev => ({ ...prev, roles: 'Error cargando roles disponibles' }))
      }
    } catch (error) {
      console.error('❌ Error cargando roles:', error)
      setErrors(prev => ({ ...prev, roles: 'Error cargando roles disponibles' }))
    } finally {
      setIsLoadingRoles(false)
    }
  }

  /**
   * Generar username automáticamente
   */
  const generateUsername = (fullName: string): string => {
    return fullName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\w]/g, '')
      .slice(0, 20)
  }

  /**
   * Verificar disponibilidad de username
   */
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    // En modo edit, si no cambió, no verificar
    if (mode === 'edit' && user && username === user.user_name) {
      setUsernameAvailable(true)
      return
    }

    try {
      setIsCheckingUsername(true)
      const response = await api.get(`${API_ENDPOINTS.users.checkUsername}?username=${encodeURIComponent(username)}`)
      setUsernameAvailable(response.data.data.available)
    } catch (error) {
      setUsernameAvailable(null)
    } finally {
      setIsCheckingUsername(false)
    }
  }

  /**
   * Verificar disponibilidad de email
   */
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null)
      return
    }

    // En modo edit, si no cambió, no verificar
    if (mode === 'edit' && user && email === user.email) {
      setEmailAvailable(true)
      return
    }

    try {
      setIsCheckingEmail(true)
      const response = await api.get(`${API_ENDPOINTS.users.checkEmail}?email=${encodeURIComponent(email)}`)
      setEmailAvailable(response.data.data.available)
    } catch (error) {
      setEmailAvailable(null)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  /**
   * Debounce para verificaciones
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.user_name) {
        checkUsernameAvailability(formData.user_name)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.user_name])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.email])

  /**
   * Manejar cambios en los campos
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Auto-generar username en modo create
    if (mode === 'create' && name === 'name' && value && !formData.user_name) {
      const generatedUsername = generateUsername(value)
      setFormData(prev => ({ ...prev, user_name: generatedUsername }))
    }
  }

  /**
   * Validar formulario
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar username
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'El nombre de usuario es requerido'
    } else if (formData.user_name.length < 3) {
      newErrors.user_name = 'El username debe tener al menos 3 caracteres'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.user_name)) {
      newErrors.user_name = 'El username solo puede contener letras, números y guiones bajos'
    } else if (usernameAvailable === false) {
      newErrors.user_name = 'Este nombre de usuario ya está en uso'
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido'
    } else if (emailAvailable === false) {
      newErrors.email = 'Este email ya está registrado'
    }

    // Validar contraseña (solo requerida en create o si se está cambiando en edit)
    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida'
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma la contraseña'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    } else if (mode === 'edit' && formData.password) {
      // En edit, validar solo si se está cambiando la contraseña
      if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    // Validar rol
    if (!formData.role_id) {
      newErrors.role_id = 'Selecciona un rol'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Evaluar fortaleza de contraseña
   */
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0
    
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const levels = [
      { strength: 0, label: 'Muy débil', color: 'bg-red-500' },
      { strength: 1, label: 'Débil', color: 'bg-red-400' },
      { strength: 2, label: 'Regular', color: 'bg-yellow-500' },
      { strength: 3, label: 'Buena', color: 'bg-yellow-400' },
      { strength: 4, label: 'Fuerte', color: 'bg-green-500' },
      { strength: 5, label: 'Muy fuerte', color: 'bg-green-600' },
      { strength: 6, label: 'Excelente', color: 'bg-green-700' }
    ]

    return levels[Math.min(strength, 6)]
  }

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      
      // Preparar datos
      const userData: any = {
        name: formData.name.trim(),
        user_name: formData.user_name.trim(),
        email: formData.email.trim(),
        role_id: Number(formData.role_id),
        is_active: formData.is_active
      }

      // Solo incluir contraseña si se está enviando
      if (formData.password) {
        userData.password = formData.password
      }

      let response
      if (mode === 'create') {
        response = await api.post('/users', userData)
      } else {
        response = await api.put(`/users/${user?.id}`, userData)
      }
      
      if (response.data.status === 'success') {
        console.log(`✅ Usuario ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente`)
        onSuccess()
      } else {
        setErrors({ general: response.data.message || `Error ${mode === 'create' ? 'creando' : 'actualizando'} usuario` })
      }
    } catch (error: any) {
      console.error(`❌ Error ${mode === 'create' ? 'creando' : 'actualizando'} usuario:`, error)
      
      if (error.status === 422 && error.data?.errors) {
        const serverErrors: { [key: string]: string } = {}
        Object.keys(error.data.errors).forEach(field => {
          serverErrors[field] = error.data.errors[field].join(', ')
        })
        setErrors(serverErrors)
      } else {
        setErrors({ general: getErrorMessage(error) })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Error general */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      {/* Información personal */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
        
        {/* Nombre completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Juan Pérez García"
            />
          </div>
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de Usuario *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                className={`w-full pl-8 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.user_name ? 'border-red-300' : 
                  usernameAvailable === false ? 'border-red-300' :
                  usernameAvailable === true ? 'border-green-300' : 'border-gray-300'
                }`}
                placeholder="jperez"
              />
              
              {/* Indicador de disponibilidad */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingUsername && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                {!isCheckingUsername && usernameAvailable === true && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                {!isCheckingUsername && usernameAvailable === false && (
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✗</span>
                  </div>
                )}
              </div>
            </div>
            {errors.user_name && <p className="text-red-600 text-sm mt-1">{errors.user_name}</p>}
            {usernameAvailable === false && !errors.user_name && (
              <p className="text-red-600 text-sm mt-1">Este nombre de usuario no está disponible</p>
            )}
            {usernameAvailable === true && (
              <p className="text-green-600 text-sm mt-1">Nombre de usuario disponible</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 
                  emailAvailable === false ? 'border-red-300' :
                  emailAvailable === true ? 'border-green-300' : 'border-gray-300'
                }`}
                placeholder="juan@ejemplo.com"
              />
              
              {/* Indicador de disponibilidad */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingEmail && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                {!isCheckingEmail && emailAvailable === true && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                {!isCheckingEmail && emailAvailable === false && (
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✗</span>
                  </div>
                )}
              </div>
            </div>
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            {emailAvailable === false && !errors.email && (
              <p className="text-red-600 text-sm mt-1">Este email ya está registrado</p>
            )}
            {emailAvailable === true && (
              <p className="text-green-600 text-sm mt-1">Email disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {mode === 'create' ? 'Configuración de Acceso' : 'Cambiar Contraseña (opcional)'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'create' ? 'Contraseña *' : 'Nueva Contraseña'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={mode === 'create' ? 'Mínimo 6 caracteres' : 'Dejar vacío para mantener actual'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Indicador de fortaleza */}
            {passwordStrength && formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                </div>
              </div>
            )}
            
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'create' ? 'Confirmar Contraseña *' : 'Confirmar Nueva Contraseña'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-300' : 
                  formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-300' : 'border-gray-300'
                }`}
                placeholder="Repite la contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
              <p className="text-green-600 text-sm mt-1">Las contraseñas coinciden</p>
            )}
          </div>
        </div>
      </div>

      {/* Permisos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Permisos y Configuración</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol del Usuario *
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                disabled={isLoadingRoles}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.role_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>
            {errors.role_id && <p className="text-red-600 text-sm mt-1">{errors.role_id}</p>}
            {errors.roles && <p className="text-red-600 text-sm mt-1">{errors.roles}</p>}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la Cuenta
            </label>
            <div className="flex items-center space-x-3 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Cuenta activa</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Los usuarios inactivos no podrán iniciar sesión
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isLoading || isCheckingUsername || isCheckingEmail}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{mode === 'create' ? 'Creando...' : 'Actualizando...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}