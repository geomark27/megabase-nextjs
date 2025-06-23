'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { UserForm } from "./UserForm"

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
 * UserSheet Component
 * 
 * Sheet lateral para crear y editar usuarios
 * - Reutilizable para create y edit
 * - Se abre desde la derecha
 * - Formulario responsivo
 * - Actualización automática de la lista
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
        className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0"
      >
        {/* Header del Sheet */}
        <SheetHeader className="p-6 pb-4 border-b border-gray-200">
          <SheetTitle className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Usuario' : `Editar Usuario`}
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            {mode === 'create' 
              ? 'Completa la información para crear una nueva cuenta de usuario.' 
              : `Modifica la información de ${user?.name || 'este usuario'}.`
            }
          </SheetDescription>
        </SheetHeader>
        
        {/* Contenido del formulario */}
        <div className="p-6">
          <UserForm 
            mode={mode}
            user={user}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}