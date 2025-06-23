'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, User, Database } from 'lucide-react'
import { authService, type LoginRequest } from '@/services/authService'
import { getErrorMessage, isApiError, isNetworkError } from '@/lib/axios'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<LoginRequest>({
    user_name: '',
    password: ''
  })
  const [errors, setErrors] = useState({
    user_name: '',
    password: ''
  })

  const validateForm = (): boolean => {
    const newErrors = {
      user_name: '',
      password: ''
    }

    if (!formData.user_name.trim()) {
      newErrors.user_name = 'El nombre de usuario es requerido'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return !newErrors.user_name && !newErrors.password
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Usar el servicio de autenticación en lugar de fetch directo
      const result = await authService.login(formData)
      
      // El servicio ya maneja las cookies automáticamente
      console.log('Login exitoso:', result)
      
      // Usar el método helper del servicio para manejar el éxito del login
      authService.handleLoginSuccess('/dashboard')
      
    } catch (err: any) {
      // Usar las funciones helper para manejar diferentes tipos de errores
      let errorMessage = ''
      
      if (isNetworkError(err)) {
        errorMessage = 'Error de conexión. Verifique que el servidor esté ejecutándose en el puerto 8080.'
      } else if (isApiError(err)) {
        errorMessage = authService.handleAuthError(err)
      } else {
        errorMessage = getErrorMessage(err)
      }
      
      setError(errorMessage)
      console.error('Error de login:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Megabase</h1>
          <p className="text-slate-400">Manejo eficiente de grandes volúmenes de datos</p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="user_name"
                  type="text"
                  value={formData.user_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre de usuario"
                />
              </div>
              {errors.user_name && (
                <p className="text-red-400 text-sm mt-1">{errors.user_name}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              ¿No tienes cuenta?{' '}
              <button className="text-blue-400 hover:text-blue-300 font-medium">
                Contacta al administrador
              </button>
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Versión 1.0.0 - Desarrollado con Go + Next.js
          </p>
        </div>
      </div>
    </div>
  )
}