'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { UserForm } from "./UserForm"
import { Sparkles, UserPlus, Edit } from "lucide-react"

/**
 * Tipos para el UserSheet
 */
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
  created_at: string
  updated_at: string
}

interface UserSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  user?: User | null
  onSuccess: () => void
}

/**
 * UserSheet Component con diseño elegante
 * 
 * Sheet lateral para crear y editar usuarios
 * - Aplicando el estilo armonioso del dashboard
 * - Efectos glassmorphism y gradientes
 * - Animaciones suaves
 */
export function UserSheet({ 
  open, 
  onOpenChange, 
  mode, 
  user, 
  onSuccess 
}: UserSheetProps) {
  
  const handleSuccess = () => {
    onSuccess() // Recargar lista de usuarios
    onOpenChange(false) // Cerrar sheet
  }

  const handleCancel = () => {
    onOpenChange(false) // Cerrar sheet sin guardar
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0 bg-background/95 backdrop-blur-sm border-border/50"
      >
        {/* Header elegante del Sheet */}
        <div className="relative">
          {/* Efecto de brillo sutil en el header */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-2xl"></div>
          
          <SheetHeader className="relative p-6 pb-4 border-b border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              {/* Icono con gradiente */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                mode === 'create' 
                  ? 'bg-gradient-to-br from-green-500/20 to-green-600/20' 
                  : 'bg-gradient-to-br from-blue-500/20 to-blue-600/20'
              }`}>
                {mode === 'create' ? (
                  <UserPlus className={`w-6 h-6 ${mode === 'create' ? 'text-green-400' : 'text-blue-400'}`} />
                ) : (
                  <Edit className="w-6 h-6 text-blue-400" />
                )}
              </div>
              
              <div>
                <SheetTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {mode === 'create' ? 'Crear Nuevo Usuario' : `Editar Usuario`}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground mt-1">
                  {mode === 'create' 
                    ? 'Completa la información para crear una nueva cuenta de usuario.' 
                    : `Modifica la información de ${user?.name || 'este usuario'}.`
                  }
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>
        
        {/* Contenido del formulario con fondo elegante */}
        <div className="relative">
          {/* Gradiente sutil de fondo */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background/90"></div>
          
          <div className="relative p-6">
            <UserForm 
              mode={mode}
              user={user}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}