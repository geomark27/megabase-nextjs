'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, EyeOff, Shield, Mail, User, Lock } from 'lucide-react'
import { api } from '@/lib/axios'
import { getErrorMessage } from '@/lib/axios'

/**
 * Interfaz para los datos del formulario de usuario
 */
interface CreateUserForm {
  name: string
  user_name: string
  email: string
  password: string
  confirmPassword: string
  role_id: number | ''
  is_active: boolean
}

/**
 * Interfaz para roles disponibles
 */
interface Role {
  id: number
  name: string
  display_name: string
  description: string
  is_active: boolean
}

/**
 * Página para crear nuevos usuarios
 * 
 * Esta página proporciona un formulario completo para crear usuarios con:
 * - Validación en tiempo real
 * - Verificación de disponibilidad de username y email
 * - Selección de roles dinámicos
 * - Generación automática de username basado en el nombre
 * - Indicadores visuales de fortaleza de contraseña
 * - Manejo de errores específicos de la API
 */
export default function CreateUserPage() {
  // Estados del formulario
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    user_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: '',
    is_active: true
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

  const router = useRouter()

  /**
   * Cargar roles disponibles al montar el componente
   */
  useEffect(() => {
    loadRoles()
  }, [])

  /**
   * Función para cargar roles desde la API
   */
  const loadRoles = async () => {
    try {
      setIsLoadingRoles(true)
      const response = await api.get('/roles')
      
      if (response.data.success) {
        // Filtrar solo roles activos
        const activeRoles = response.data.data.filter((role: Role) => role.is_active)
        setRoles(activeRoles)
      }
    } catch (error) {
      console.error('Error cargando roles:', error)
      setErrors(prev => ({ ...prev, roles: 'Error cargando roles disponibles' }))
    } finally {
      setIsLoadingRoles(false)
    }
  }

  /**
   * Función para generar username automáticamente basado en el nombre
   */
  const generateUsername = (fullName: string): string => {
    return fullName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\w]/g, '')
      .slice(0, 20)
  }

  /**
   * Función para verificar disponibilidad de username
   */
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    try {
      setIsCheckingUsername(true)
      const response = await api.get(`/users/check-username?username=${encodeURIComponent(username)}`)
      setUsernameAvailable(response.data.available)
    } catch (error) {
      setUsernameAvailable(null)
    } finally {
      setIsCheckingUsername(false)
    }
  }

  /**
   * Función para verificar disponibilidad de email
   */
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null)
      return
    }

    try {
      setIsCheckingEmail(true)
      const response = await api.get(`/users/check-email?email=${encodeURIComponent(email)}`)
      setEmailAvailable(response.data.available)
    } catch (error) {
      setEmailAvailable(null)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  /**
   * Debounce para verificaciones de disponibilidad
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
   * Manejar cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Limpiar errores del campo al empezar a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Auto-generar username cuando se cambia el nombre
    if (name === 'name' && value && !formData.user_name) {
      const generatedUsername = generateUsername(value)
      setFormData(prev => ({ ...prev, user_name: generatedUsername }))
    }
  }

  /**
   * Validar formulario antes de enviar
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

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
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
      
      // Preparar datos para enviar
      const userData = {
        name: formData.name.trim(),
        user_name: formData.user_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role_id: Number(formData.role_id),
        is_active: formData.is_active
      }

      const response = await api.post('/users', userData)
      
      if (response.data.success) {
        console.log('✅ Usuario creado exitosamente')
        router.push('/users')
      }
    } catch (error: any) {
      console.error('❌ Error creando usuario:', error)
      
      if (error.status === 422 && error.data?.errors) {
        // Errores de validación del servidor
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear Nuevo Usuario</h1>
        <p className="text-gray-600">
          Completa la información para crear una nueva cuenta de usuario en el sistema.
        </p>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Información personal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombre completo */}
              <div className="md:col-span-2">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Acceso</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
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
                    placeholder="Mínimo 6 caracteres"
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
                  Confirmar Contraseña *
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permisos y Configuración</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
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
                        {role.display_name} - {role.description}
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

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
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
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Crear Usuario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}