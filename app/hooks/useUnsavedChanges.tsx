"use client"

import { useEffect, useRef } from "react"
import { useConfirm } from "./useConfirm"

export function useUnsavedChanges(hasUnsavedChanges: boolean, message?: string) {
  const { confirm } = useConfirm()
  const hasUnsavedRef = useRef(hasUnsavedChanges)

  // Actualizar la referencia cuando cambie el estado
  useEffect(() => {
    hasUnsavedRef.current = hasUnsavedChanges
  }, [hasUnsavedChanges])

  useEffect(() => {
    // Proteger contra cerrar/recargar navegador
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current) {
        e.preventDefault()
        e.returnValue = message || "¿Estás seguro de que quieres salir? Se perderán los cambios no guardados."
        return e.returnValue
      }
    }

    // Proteger contra navegación con botón atrás/adelante
    const handlePopState = async (e: PopStateEvent) => {
      if (hasUnsavedRef.current) {
        // Prevenir la navegación inmediatamente
        window.history.pushState(null, "", window.location.href)

        // Mostrar confirmación personalizada
        const shouldLeave = await confirm({
          title: "¿Salir sin guardar?",
          description: message || "Se perderán los cambios no guardados. ¿Estás seguro de que quieres continuar?",
          confirmText: "Salir sin guardar",
          cancelText: "Continuar editando",
          variant: "warning",
          icon: "logout",
        })

        if (shouldLeave) {
          // Permitir la navegación
          hasUnsavedRef.current = false
          window.history.back()
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    // Agregar estado inicial para detectar navegación
    if (hasUnsavedChanges) {
      window.history.pushState(null, "", window.location.href)
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [hasUnsavedChanges, message, confirm])

  // Función helper para confirmación manual de navegación
  const confirmNavigation = async (customMessage?: string): Promise<boolean> => {
    if (!hasUnsavedChanges) return true

    return await confirm({
      title: "¿Salir sin guardar?",
      description:
        customMessage || message || "Se perderán los cambios no guardados. ¿Estás seguro de que quieres continuar?",
      confirmText: "Salir sin guardar",
      cancelText: "Continuar editando",
      variant: "warning",
      icon: "logout",
    })
  }

  return { confirmNavigation }
}
