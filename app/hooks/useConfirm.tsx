"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { BaseModal } from "@/components/ui/BaseModal"
import { AlertTriangle, Trash2 } from "lucide-react"

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning"
  icon?: "warning" | "delete" | "logout" | "restore" | "shield"
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options)
      setResolver(() => resolve)
      setIsOpen(true)
    })
  }

  const handleConfirm = () => {
    if (resolver) {
      resolver(true)
      setResolver(null)
    }
    setIsOpen(false)
    setOptions(null)
  }

  const handleCancel = () => {
    if (resolver) {
      resolver(false)
      setResolver(null)
    }
    setIsOpen(false)
    setOptions(null)
  }

  const getIcon = () => {
    if (!options?.icon) return <AlertTriangle className="h-6 w-6 text-gray-600" />

    switch (options.icon) {
      case "delete":
        return <Trash2 className="h-6 w-6 text-red-600" />
      case "logout":
      case "restore":
      case "shield":
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-600" />
    }
  }

  const getVariantStyles = () => {
    switch (options?.variant) {
      case "destructive":
        return "bg-red-50 border-red-200"
      case "warning":
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getTitle = () => {
    if (!options) return ""

    // UX Copy profesional según el tipo de acción
    switch (options.icon) {
      case "delete":
        return "Confirmar eliminación"
      case "logout":
        return "¿Salir sin guardar?"
      case "restore":
        return "Restaurar información"
      case "shield":
        return "Proteger datos"
      default:
        return options.title
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title={getTitle()}
        subtitle={options?.description}
        primaryAction={{
          label: options?.confirmText || "Confirmar",
          onClick: handleConfirm,
          variant: options?.variant === "destructive" ? "destructive" : "default",
        }}
        secondaryAction={{
          label: options?.cancelText || "Cancelar",
          onClick: handleCancel,
        }}
      >
        <div className={`flex items-center space-x-3 p-4 rounded-lg ${getVariantStyles()}`}>
          {getIcon()}
          <div>
            <h4 className="font-medium text-gray-900">{options?.title}</h4>
          </div>
        </div>
      </BaseModal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }
  return context
}
