"use client"

// Script para limpiar localStorage de datos antiguos
export const cleanupLocalStorage = () => {
  if (typeof window === "undefined") return

  try {
    console.log("🧹 Limpiando localStorage de datos antiguos...")

    // Lista de todas las claves que usaba la aplicación
    const keysToRemove = [
      "food-business-configuracion",
      "food-business-insumos",
      "food-business-productos",
      "food-business-productos-base",
      "food-business-lotes",
      "food-business-version",
      "food-business-migrations",
    ]

    // Eliminar claves específicas
    keysToRemove.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        console.log(`🗑️ Eliminado: ${key}`)
      }
    })

    // Eliminar todos los backups antiguos
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("food-business-backup-")) {
        localStorage.removeItem(key)
        console.log(`🗑️ Eliminado backup: ${key}`)
      }
    })

    // Marcar que ya se hizo la limpieza
    localStorage.setItem("food-business-cleanup-done", "true")

    console.log("✅ Limpieza de localStorage completada")
  } catch (error) {
    console.error("❌ Error limpiando localStorage:", error)
  }
}

// Función para verificar si ya se hizo la limpieza
export const shouldCleanup = (): boolean => {
  if (typeof window === "undefined") return false
  return !localStorage.getItem("food-business-cleanup-done")
}
