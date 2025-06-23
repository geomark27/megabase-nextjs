'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Shield, Mail, User, Lock, Save, X, CheckCircle2, AlertCircle } from 'lucide-react'
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
 * UserForm Component con diseño elegante
 * 
 * Formulario reutilizable para crear y editar usuarios
 * - Aplicando el estilo armonioso del dashboard
 * - Variables semánticas de colores
 * - Efectos visuales elegantes
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
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Error general elegante */}
      {errors.general && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent rounded-xl blur-xl"></div>
          <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información personal */}
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl blur-xl"></div>
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Información Personal</span>
            </h3>
            
            {/* Nombre completo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all ${
                    errors.name ? 'border-red-500/50 bg-red-500/5' : 'border-border/50'
                  }`}
                  placeholder="Ej: Juan Pérez García"
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de Usuario *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    type="text"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    className={`w-full pl-8 pr-12 py-3 bg-background/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all ${
                      errors.user_name ? 'border-red-500/50 bg-red-500/5' : 
                      usernameAvailable === false ? 'border-red-500/50 bg-red-500/5' :
                      usernameAvailable === true ? 'border-green-500/50 bg-green-500/5' : 'border-border/50'
                    }`}
                    placeholder="jperez"
                  />
                  
                  {/* Indicador de disponibilidad elegante */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isCheckingUsername && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
                    )}
                    {!isCheckingUsername && usernameAvailable === true && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                    {!isCheckingUsername && usernameAvailable === false && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                {errors.user_name && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.user_name}</span>
                  </p>
                )}
                {usernameAvailable === false && !errors.user_name && (
                  <p className="text-red-400 text-sm mt-2">Este nombre de usuario no está disponible</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-green-400 text-sm mt-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Nombre de usuario disponible</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-background/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all ${
                      errors.email ? 'border-red-500/50 bg-red-500/5' : 
                      emailAvailable === false ? 'border-red-500/50 bg-red-500/5' :
                      emailAvailable === true ? 'border-green-500/50 bg-green-500/5' : 'border-border/50'
                    }`}
                    placeholder="juan@ejemplo.com"
                  />
                  
                  {/* Indicador de disponibilidad elegante */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isCheckingEmail && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
                    )}
                    {!isCheckingEmail && emailAvailable === true && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                    {!isCheckingEmail && emailAvailable === false && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
                {emailAvailable === false && !errors.email && (
                  <p className="text-red-400 text-sm mt-2">Este email ya está registrado</p>
                )}
                {emailAvailable === true && (
                  <p className="text-green-400 text-sm mt-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Email disponible</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl blur-xl"></div>
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-primary" />
              <span>{mode === 'create' ? 'Configuración de Acceso' : 'Cambiar Contraseña (opcional)'}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {mode === 'create' ? 'Contraseña *' : 'Nueva Contraseña'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-background/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all ${
                      errors.password ? 'border-red-500/50 bg-red-500/5' : 'border-border/50'
                    }`}
                    placeholder={mode === 'create' ? 'Mínimo 6 caracteres' : 'Dejar vacío para mantener actual'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Indicador de fortaleza elegante */}
                {passwordStrength && formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-muted/30 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${passwordStrength.color} transition-all duration-500`}
                          style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {mode === 'create' ? 'Confirmar Contraseña *' : 'Confirmar Nueva Contraseña'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-background/50 border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all ${
                      errors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : 
                      formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500/50 bg-green-500/5' : 'border-border/50'
                    }`}
                    placeholder="Repite la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <p className="text-green-400 text-sm mt-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Las contraseñas coinciden</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permisos */}
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl blur-xl"></div>
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Permisos y Configuración</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rol del Usuario *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    disabled={isLoadingRoles}
                    className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all ${
                      errors.role_id ? 'border-red-500/50 bg-red-500/5' : 'border-border/50'
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
                {errors.role_id && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.role_id}</span>
                  </p>
                )}
                {errors.roles && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.roles}</span>
                  </p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado de la Cuenta
                </label>
                <div className="flex items-center space-x-3 pt-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="rounded border-border text-primary focus:ring-primary/50"
                    />
                    <span className="text-sm text-foreground">Cuenta activa</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Los usuarios inactivos no podrán iniciar sesión
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones elegantes */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border/50">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-border/50 text-foreground rounded-xl hover:bg-accent/50 transition-all duration-200"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isLoading || isCheckingUsername || isCheckingEmail}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary disabled:from-primary/50 disabled:to-primary/50 text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground"></div>
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