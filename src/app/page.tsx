'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, User, Database, Sparkles, ArrowRight } from 'lucide-react'
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
        errorMessage = err.message || 'Error de autenticación'
      } else {
        errorMessage = getErrorMessage(err)
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo con gradientes mejorados y animaciones */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Efectos de fondo animados */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Orbes flotantes */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Patrón de puntos decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-2 h-2 bg-white rounded-full animate-ping" style={{top: '20%', left: '10%', animationDelay: '0s'}}></div>
          <div className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{top: '60%', left: '80%', animationDelay: '1s'}}></div>
          <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{top: '80%', left: '20%', animationDelay: '2s'}}></div>
          <div className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{top: '30%', left: '70%', animationDelay: '3s'}}></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo y título con animación de entrada */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/25 animate-float relative">
              <Database className="w-10 h-10 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Megabase
            </h1>
            <p className="text-blue-100/80 text-lg font-medium">
              Manejo eficiente de grandes volúmenes de datos
            </p>
          </div>

          {/* Tarjeta de login mejorada */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl shadow-black/20 p-8 animate-slide-up">
            {/* Header del formulario */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Campo Usuario */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-100 block">Usuario</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-white/15 ${
                      errors.user_name 
                        ? 'border-red-400/60 focus:ring-red-500/50' 
                        : 'border-white/20 focus:ring-blue-500/50 hover:border-white/30'
                    }`}
                    placeholder="Nombre de usuario"
                  />
                  {/* Efecto de brillo en focus */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.user_name && (
                  <p className="text-red-300 text-sm font-medium flex items-center space-x-1 animate-shake">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    <span>{errors.user_name}</span>
                  </p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-100 block">Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-12 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-white/15 ${
                      errors.password 
                        ? 'border-red-400/60 focus:ring-red-500/50' 
                        : 'border-white/20 focus:ring-blue-500/50 hover:border-white/30'
                    }`}
                    placeholder="Contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-blue-300 hover:text-white transition-colors duration-200 rounded-md hover:bg-white/10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {/* Efecto de brillo en focus */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm font-medium flex items-center space-x-1 animate-shake">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Mensaje de error general */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 animate-slide-down">
                  <p className="text-red-200 text-sm font-medium flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    <span>{error}</span>
                  </p>
                </div>
              )}

              {/* Botón de submit mejorado */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-blue-500/25 group"
              >
                {/* Efecto de brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="relative flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer del formulario */}
            <div className="mt-8 text-center">
              <p className="text-blue-100/70 text-sm">
                ¿No tienes cuenta?{' '}
                <button className="text-blue-300 hover:text-white font-semibold hover:underline transition-colors duration-200">
                  Contacta al administrador
                </button>
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center animate-fade-in-delay">
            <p className="text-blue-200/60 text-sm">
              Versión 1.0.0 - Desarrollado con Go + Next.js
            </p>
          </div>
        </div>
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1.2s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}