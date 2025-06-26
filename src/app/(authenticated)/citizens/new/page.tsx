// src/app/(authenticated)/citizens/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { useAuthenticatedUser } from '../../layout'
import { citizenService } from '@/services/citizenService'
import { 
  CreateCitizenRequest,
  TipoIdentificacion,
  EstadoContribuyente,
  RegimenTributario,
  Genero,
  EstadoCivil,
  isPersonaNatural,
  isEmpresa,
  validateEcuadorianIdentification
} from '@/types/citizen'

/**
 * NewCitizenPage - Formulario inteligente para crear nuevos ciudadanos/contribuyentes
 * ✅ CORREGIDO: Manejo correcto de respuestas del backend
 */
export default function NewCitizenPage() {
  const router = useRouter()
  const { user } = useAuthenticatedUser()

  // ========================================
  // ESTADO DEL FORMULARIO
  // ========================================

  const [formData, setFormData] = useState<CreateCitizenRequest>({
    // Campos requeridos básicos
    numero_identificacion: '',
    tipo_identificacion: '',
    email: '',
    celular: '',
    convencional: '',
    direccion_principal: '',
    pais: 'Ecuador',
    provincia: '',
    ciudad: '',
    
    // Campos tributarios requeridos
    tipo_contribuyente: 'NATURAL',
    estado_contribuyente: 'ACTIVO',
    regimen: 'REGIMEN_GENERAL',
    categoria: 'CATEGORIA_1',
    obligado_contabilidad: 'NO',
    actividad_economica_principal: ''
  })

  // Estados de UI y validación
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados para validaciones en tiempo real
  const [validatingIdentification, setValidatingIdentification] = useState(false)
  const [validatingEmail, setValidatingEmail] = useState(false)
  const [validatingRazonSocial, setValidatingRazonSocial] = useState(false)

  // Estados de disponibilidad
  const [identificationAvailable, setIdentificationAvailable] = useState<boolean | null>(null)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [razonSocialAvailable, setRazonSocialAvailable] = useState<boolean | null>(null)

  // ========================================
  // EFECTOS Y VALIDACIONES
  // ========================================

  /**
   * Validar identificación cuando cambia el número o tipo
   */
  useEffect(() => {
    if (formData.numero_identificacion && formData.tipo_identificacion) {
      validateIdentificationNumber()
    } else {
      setIdentificationAvailable(null)
    }
  }, [formData.numero_identificacion, formData.tipo_identificacion])

  /**
   * Validar email cuando cambia
   */
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      validateEmailAvailability()
    } else {
      setEmailAvailable(null)
    }
  }, [formData.email])

  /**
   * Validar razón social cuando cambia (solo para empresas)
   */
  useEffect(() => {
    if (isEmpresa(formData.tipo_identificacion) && formData.razon_social) {
      validateRazonSocialAvailability()
    } else {
      setRazonSocialAvailable(null)
    }
  }, [formData.razon_social, formData.tipo_identificacion])

  /**
   * Ajustar campos automáticamente según tipo de identificación
   */
  useEffect(() => {
    if (formData.tipo_identificacion) {
      adjustFieldsByType()
    }
  }, [formData.tipo_identificacion])

  // ========================================
  // FUNCIONES DE VALIDACIÓN
  // ========================================

  /**
   * Validar número de identificación en tiempo real
   */
  const validateIdentificationNumber = async () => {
    const { numero_identificacion, tipo_identificacion } = formData

    // Validar formato primero
    if (!validateEcuadorianIdentification(numero_identificacion, tipo_identificacion)) {
      setErrors(prev => ({ 
        ...prev, 
        numero_identificacion: 'Formato de identificación inválido para el tipo seleccionado' 
      }))
      setIdentificationAvailable(false)
      return
    }

    // Limpiar error de formato
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.numero_identificacion
      return newErrors
    })

    try {
      setValidatingIdentification(true)
      const response = await citizenService.checkIdentificationAvailability(numero_identificacion)
      const available = response.available
      setIdentificationAvailable(available)
      
      if (!available) {
        setErrors(prev => ({ 
          ...prev, 
          numero_identificacion: 'Este número de identificación ya está registrado' 
        }))
      }
    } catch (error) {
      console.error('Error validando identificación:', error)
    } finally {
      setValidatingIdentification(false)
    }
  }

  /**
   * Validar disponibilidad de email
   */
  const validateEmailAvailability = async () => {
    try {
      setValidatingEmail(true)
      const response = await citizenService.checkEmailAvailability(formData.email)
      
      const available = response.available
      setEmailAvailable(available)
      
      if (!available) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Este email ya está registrado' 
        }))
      } else {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.email
          return newErrors
        })
      }
    } catch (error) {
      console.error('Error validando email:', error)
    } finally {
      setValidatingEmail(false)
    }
  }

  /**
   * Validar disponibilidad de razón social
   */
  const validateRazonSocialAvailability = async () => {
    if (!formData.razon_social) return

    try {
      setValidatingRazonSocial(true)
      const response = await citizenService.checkRazonSocialAvailability(formData.razon_social)
      
      const available = response.available
      setRazonSocialAvailable(available)
      
      if (!available) {
        setErrors(prev => ({ 
          ...prev, 
          razon_social: 'Esta razón social ya está registrada' 
        }))
      } else {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.razon_social
          return newErrors
        })
      }
    } catch (error) {
      console.error('Error validando razón social:', error)
    } finally {
      setValidatingRazonSocial(false)
    }
  }

  /**
   * Ajustar campos automáticamente según el tipo de identificación
   */
  const adjustFieldsByType = () => {
    const tipo = formData.tipo_identificacion

    if (isPersonaNatural(tipo)) {
      // Para personas naturales, limpiar campos de empresa
      setFormData(prev => ({
        ...prev,
        razon_social: undefined,
        nombre_comercial: undefined,
        tipo_empresa: undefined,
        representantes_legales: undefined,
        tipo_contribuyente: 'NATURAL',
        // Asegurar que tenga campos de persona natural
        nombre: prev.nombre || '',
        genero: prev.genero || undefined,
        estado_civil: prev.estado_civil || undefined
      }))
    } else if (isEmpresa(tipo)) {
      // Para empresas, limpiar campos de persona natural
      setFormData(prev => ({
        ...prev,
        nombre: undefined,
        fecha_nacimiento: undefined,
        nacionalidad: undefined,
        estado_civil: undefined,
        genero: undefined,
        tipo_contribuyente: 'JURIDICA',
        // Asegurar que tenga campos de empresa
        razon_social: prev.razon_social || '',
        tipo_empresa: prev.tipo_empresa || 'SOCIEDAD_ANONIMA'
      }))
    }
  }

  // ========================================
  // HANDLERS DE EVENTOS
  // ========================================

  /**
   * Manejar cambios en campos del formulario
   */
  const handleFieldChange = (field: keyof CreateCitizenRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  /**
   * Validar formulario antes del envío
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validaciones básicas
    if (!formData.numero_identificacion) {
      newErrors.numero_identificacion = 'Número de identificación es requerido'
    }
    if (!formData.tipo_identificacion) {
      newErrors.tipo_identificacion = 'Tipo de identificación es requerido'
    }
    if (!formData.email) {
      newErrors.email = 'Email es requerido'
    }
    if (!formData.celular) {
      newErrors.celular = 'Número de celular es requerido'
    }
    if (!formData.provincia) {
      newErrors.provincia = 'Provincia es requerida'
    }
    if (!formData.ciudad) {
      newErrors.ciudad = 'Ciudad es requerida'
    }
    if (!formData.actividad_economica_principal) {
      newErrors.actividad_economica_principal = 'Actividad económica es requerida'
    }

    // Validaciones condicionales según tipo
    if (isPersonaNatural(formData.tipo_identificacion)) {
      if (!formData.nombre) {
        newErrors.nombre = 'Nombre es requerido para personas naturales'
      }
    } else if (isEmpresa(formData.tipo_identificacion)) {
      if (!formData.razon_social) {
        newErrors.razon_social = 'Razón social es requerida para empresas'
      }
    }

    // Verificar disponibilidad
    if (identificationAvailable === false) {
      newErrors.numero_identificacion = 'Este número de identificación ya está registrado'
    }
    if (emailAvailable === false) {
      newErrors.email = 'Este email ya está registrado'
    }
    if (isEmpresa(formData.tipo_identificacion) && razonSocialAvailable === false) {
      newErrors.razon_social = 'Esta razón social ya está registrada'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Enviar formulario
   * ✅ CORREGIDO: Acceso correcto a la respuesta del backend
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      console.log('🚀 Creando ciudadano:', formData)

      const response = await citizenService.createCitizen(formData)

      if (response.success) {
        // ✅ CORREGIDO: El citizen está directamente en response.data
        console.log('✅ Ciudadano creado exitosamente:', response.data.id)
        
        // Mostrar mensaje de éxito (opcional)
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.general
          return newErrors
        })
        
        // Redirigir a la lista de ciudadanos
        router.push('/citizens')
      }
    } catch (error: any) {
      console.error('❌ Error creando ciudadano:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: error.message || 'Error al crear el ciudadano' 
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Cancelar y volver a la lista
   */
  const handleCancel = () => {
    router.push('/citizens')
  }

  // ========================================
  // HELPERS PARA RENDERIZADO
  // ========================================

  const currentTipoEsPersonaNatural = isPersonaNatural(formData.tipo_identificacion)
  const currentTipoEsEmpresa = isEmpresa(formData.tipo_identificacion)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="p-6 max-w-4xl mx-auto">
        
        {/* Header elegante */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="w-10 h-10 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl flex items-center justify-center hover:bg-muted/30 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                  {currentTipoEsEmpresa ? (
                    <Building2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <User className="w-6 h-6 text-green-400" />
                  )}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Nuevo Ciudadano
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {currentTipoEsEmpresa 
                      ? 'Registrar nueva empresa en el sistema fiscal'
                      : currentTipoEsPersonaNatural 
                        ? 'Registrar nueva persona natural en el sistema fiscal'
                        : 'Registrar nuevo contribuyente en el sistema fiscal'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sección: Tipo de Identificación */}
          <FormSection 
            title="Tipo de Contribuyente" 
            subtitle="Selecciona el tipo de identificación que determinará los campos del formulario"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Tipo de identificación */}
              <FormField 
                label="Tipo de Identificación"
                required
                error={errors.tipo_identificacion}
              >
                <select
                  value={formData.tipo_identificacion}
                  onChange={(e) => handleFieldChange('tipo_identificacion', e.target.value)}
                  className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="05">Cédula de Identidad (Persona Natural)</option>
                  <option value="04">RUC (Empresa)</option>
                  <option value="06">Pasaporte</option>
                  <option value="07">Consumidor Final</option>
                </select>
              </FormField>

              {/* Número de identificación */}
              <FormField 
                label="Número de Identificación"
                required
                error={errors.numero_identificacion}
                success={identificationAvailable === true}
                isValidating={validatingIdentification}
              >
                <input
                  type="text"
                  value={formData.numero_identificacion}
                  onChange={(e) => handleFieldChange('numero_identificacion', e.target.value)}
                  placeholder={
                    formData.tipo_identificacion === '05' ? '1234567890' :
                    formData.tipo_identificacion === '04' ? '1234567890001' :
                    formData.tipo_identificacion === '06' ? 'ABC123456' :
                    'Número de identificación'
                  }
                  maxLength={
                    formData.tipo_identificacion === '05' ? 10 :
                    formData.tipo_identificacion === '04' ? 13 :
                    20
                  }
                  className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Sección: Datos Principales (condicional) */}
          {formData.tipo_identificacion && (
            <FormSection 
              title={currentTipoEsEmpresa ? "Datos de la Empresa" : "Datos Personales"}
              subtitle={currentTipoEsEmpresa 
                ? "Información legal y comercial de la empresa"
                : "Información personal del contribuyente"
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Campos para persona natural */}
                {currentTipoEsPersonaNatural && (
                  <>
                    <FormField 
                      label="Nombre Completo"
                      required
                      error={errors.nombre}
                    >
                      <input
                        type="text"
                        value={formData.nombre || ''}
                        onChange={(e) => handleFieldChange('nombre', e.target.value)}
                        placeholder="Juan Carlos Pérez González"
                        className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </FormField>

                    <FormField label="Fecha de Nacimiento">
                      <input
                        type="date"
                        value={formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFieldChange('fecha_nacimiento', e.target.value)}
                        className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </FormField>

                    <FormField label="Género">
                      <select
                        value={formData.genero || ''}
                        onChange={(e) => handleFieldChange('genero', e.target.value)}
                        className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                      </select>
                    </FormField>

                    <FormField label="Estado Civil">
                      <select
                        value={formData.estado_civil || ''}
                        onChange={(e) => handleFieldChange('estado_civil', e.target.value)}
                        className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="SOLTERO">Soltero/a</option>
                        <option value="CASADO">Casado/a</option>
                        <option value="DIVORCIADO">Divorciado/a</option>
                        <option value="VIUDO">Viudo/a</option>
                        <option value="UNION_LIBRE">Unión Libre</option>
                      </select>
                    </FormField>
                  </>
                )}

                {/* Campos para empresa */}
                {currentTipoEsEmpresa && (
                  <>
                    <FormField 
                      label="Razón Social"
                      required
                      error={errors.razon_social}
                      success={razonSocialAvailable === true}
                      isValidating={validatingRazonSocial}
                    >
                      <input
                        type="text"
                        value={formData.razon_social || ''}
                        onChange={(e) => handleFieldChange('razon_social', e.target.value)}
                        placeholder="EMPRESA EJEMPLO S.A."
                        className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </FormField>

                    <FormField label="Nombre Comercial">
                      <input
                        type="text"
                        value={formData.nombre_comercial || ''}
                        onChange={(e) => handleFieldChange('nombre_comercial', e.target.value)}
                        placeholder="Nombre comercial de la empresa"
                        className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </FormField>

                    <FormField label="Tipo de Empresa">
                      <select
                        value={formData.tipo_empresa || ''}
                        onChange={(e) => handleFieldChange('tipo_empresa', e.target.value)}
                        className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="SOCIEDAD_ANONIMA">Sociedad Anónima</option>
                        <option value="COMPANIA_LIMITADA">Compañía Limitada</option>
                        <option value="PERSONA_NATURAL">Persona Natural con Actividad Empresarial</option>
                        <option value="SOCIEDAD_CIVIL">Sociedad Civil</option>
                        <option value="COOPERATIVA">Cooperativa</option>
                        <option value="FUNDACION">Fundación</option>
                        <option value="CORPORACION">Corporación</option>
                      </select>
                    </FormField>
                  </>
                )}
              </div>
            </FormSection>
          )}

          {/* Sección: Información de Contacto */}
          {formData.tipo_identificacion && (
            <FormSection 
              title="Información de Contacto"
              subtitle="Datos de comunicación y ubicación"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <FormField 
                  label="Email"
                  required
                  error={errors.email}
                  success={emailAvailable === true}
                  isValidating={validatingEmail}
                >
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </FormField>

                <FormField 
                  label="Número de Celular"
                  required
                  error={errors.celular}
                >
                  <input
                    type="tel"
                    value={formData.celular}
                    onChange={(e) => handleFieldChange('celular', e.target.value)}
                    placeholder="0998765432"
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </FormField>

                <FormField label="Teléfono Convencional">
                  <input
                    type="tel"
                    value={formData.convencional}
                    onChange={(e) => handleFieldChange('convencional', e.target.value)}
                    placeholder="042345678"
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </FormField>

                <FormField 
                  label="Dirección Principal"
                  required
                  error={errors.direccion_principal}
                >
                  <input
                    type="text"
                    value={formData.direccion_principal}
                    onChange={(e) => handleFieldChange('direccion_principal', e.target.value)}
                    placeholder="Av. Principal 123 y Secundaria"
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </FormField>

                <FormField 
                  label="Provincia"
                  required
                  error={errors.provincia}
                >
                  <select
                    value={formData.provincia}
                    onChange={(e) => handleFieldChange('provincia', e.target.value)}
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  >
                    <option value="">Seleccionar provincia...</option>
                    <option value="Azuay">Azuay</option>
                    <option value="Bolívar">Bolívar</option>
                    <option value="Cañar">Cañar</option>
                    <option value="Carchi">Carchi</option>
                    <option value="Chimborazo">Chimborazo</option>
                    <option value="Cotopaxi">Cotopaxi</option>
                    <option value="El Oro">El Oro</option>
                    <option value="Esmeraldas">Esmeraldas</option>
                    <option value="Galápagos">Galápagos</option>
                    <option value="Guayas">Guayas</option>
                    <option value="Imbabura">Imbabura</option>
                    <option value="Loja">Loja</option>
                    <option value="Los Ríos">Los Ríos</option>
                    <option value="Manabí">Manabí</option>
                    <option value="Morona Santiago">Morona Santiago</option>
                    <option value="Napo">Napo</option>
                    <option value="Orellana">Orellana</option>
                    <option value="Pastaza">Pastaza</option>
                    <option value="Pichincha">Pichincha</option>
                    <option value="Santa Elena">Santa Elena</option>
                    <option value="Santo Domingo de los Tsáchilas">Santo Domingo de los Tsáchilas</option>
                    <option value="Sucumbíos">Sucumbíos</option>
                    <option value="Tungurahua">Tungurahua</option>
                    <option value="Zamora Chinchipe">Zamora Chinchipe</option>
                  </select>
                </FormField>

                <FormField 
                  label="Ciudad"
                  required
                  error={errors.ciudad}
                >
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => handleFieldChange('ciudad', e.target.value)}
                    placeholder="Guayaquil"
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </FormField>
              </div>
            </FormSection>
          )}

          {/* Sección: Información Tributaria */}
          {formData.tipo_identificacion && (
            <FormSection 
              title="Información Tributaria"
              subtitle="Configuración fiscal y tributaria"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <FormField 
                  label="Actividad Económica Principal"
                  required
                  error={errors.actividad_economica_principal}
                >
                  <input
                    type="text"
                    value={formData.actividad_economica_principal}
                    onChange={(e) => handleFieldChange('actividad_economica_principal', e.target.value)}
                    placeholder="Comercio al por menor"
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </FormField>

                <FormField label="Régimen Tributario">
                  <select
                    value={formData.regimen}
                    onChange={(e) => handleFieldChange('regimen', e.target.value)}
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  >
                    <option value="REGIMEN_GENERAL">Régimen General</option>
                    <option value="RIMPE_EMPRENDEDOR">RIMPE Emprendedor</option>
                    <option value="RIMPE_NEGOCIOS_POPULARES">RIMPE Negocios Populares</option>
                    <option value="RIMPE_MICROEMPRESAS">RIMPE Microempresas</option>
                    <option value="ARTESANO">Artesano</option>
                  </select>
                </FormField>

                <FormField label="Obligado a llevar Contabilidad">
                  <select
                    value={formData.obligado_contabilidad}
                    onChange={(e) => handleFieldChange('obligado_contabilidad', e.target.value)}
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  >
                    <option value="NO">No</option>
                    <option value="SI">Sí</option>
                  </select>
                </FormField>

                <FormField label="Estado del Contribuyente">
                  <select
                    value={formData.estado_contribuyente}
                    onChange={(e) => handleFieldChange('estado_contribuyente', e.target.value)}
                    className="w-full p-3 bg-background/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="SUSPENDIDO">Suspendido</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </FormField>
              </div>
            </FormSection>
          )}

          {/* Error general */}
          {errors.general && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent rounded-xl blur-xl"></div>
              <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl blur-xl"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-border rounded-xl hover:bg-accent transition-colors text-foreground disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.tipo_identificacion}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Crear Ciudadano</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

/**
 * Componente de sección del formulario
 */
interface FormSectionProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl blur-xl"></div>
      <div className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-6 hover:shadow-lg transition-all duration-300">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

/**
 * Componente de campo del formulario
 */
interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  success?: boolean
  isValidating?: boolean
  children: React.ReactNode
}

function FormField({ label, required, error, success, isValidating, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        
        {/* Indicadores de validación */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          {isValidating && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
          {!isValidating && success && (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          )}
          {!isValidating && error && (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}