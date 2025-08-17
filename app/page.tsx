"use client"

import { useState } from "react"
import { AppProvider } from "./context/AppContext"
import { AuthProvider } from "./components/auth/AuthProvider"
import { Sidebar } from "./components/Sidebar"
import { Dashboard } from "./components/Dashboard"
import { ConfiguracionCostos } from "./components/ConfiguracionCostos"
import { DatosRespaldos } from "./components/DatosRespaldos"
import { Insumos } from "./components/Insumos"
import { Productos } from "./components/Productos"
import { Documentacion } from "./components/Documentacion"
import { useConfirm } from "./hooks/useConfirm"

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [pendingView, setPendingView] = useState<string | null>(null)

  const { confirm } = useConfirm()

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />
      case "configuracion-costos":
        return <ConfiguracionCostos />
      case "datos-respaldos":
        return <DatosRespaldos />
      case "insumos":
        return <Insumos onPendingChanges={reportPendingChanges} />
      case "productos":
        return <Productos onPendingChanges={reportPendingChanges} />
      case "guia-calculos":
        return <Documentacion />
      default:
        return <Dashboard />
    }
  }

  const handleViewChange = async (view: string) => {
    // Si hay cambios pendientes, pedir confirmación
    if (hasPendingChanges) {
      const shouldLeave = await confirm({
        title: "¿Salir sin guardar?",
        description: "Se perderán los cambios no guardados. ¿Estás seguro de que quieres continuar?",
        confirmText: "Salir sin guardar",
        cancelText: "Continuar editando",
        variant: "warning",
        icon: "logout",
      })

      if (!shouldLeave) {
        return // No cambiar vista
      }
    }

    // Cambiar vista
    setActiveView(view)
    setHasPendingChanges(false)

    // Reset scroll to top when changing views
    const mainElement = document.querySelector("main")
    if (mainElement) {
      mainElement.scrollTop = 0
    }
  }

  const reportPendingChanges = (hasChanges: boolean) => {
    setHasPendingChanges(hasChanges)
  }

  return (
    <AuthProvider>
      <AppProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar
            activeView={activeView}
            setActiveView={handleViewChange}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <main className="flex-1 overflow-auto transition-all duration-300">
            <div className="p-6">{renderContent()}</div>
          </main>
        </div>
      </AppProvider>
    </AuthProvider>
  )
}
