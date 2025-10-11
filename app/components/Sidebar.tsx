"use client"

import { Home, Package, ChefHat, Calculator, BookOpen, ChevronLeft, ChevronRight, Database, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth/AuthProvider"
import { useConfirm } from "../hooks/useConfirm"
import { toast } from "sonner"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ activeView, setActiveView, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user, signOut } = useAuth()
  const { confirm } = useConfirm()

  const menuItems = [
    { id: "dashboard", label: "Inicio", icon: Home, group: null },
    { id: "configuracion-costos", label: "Costos Indirectos", icon: Calculator, group: "operaciones" },
    { id: "insumos", label: "Materias Primas", icon: Package, group: "operaciones" },
    { id: "productos", label: "Mis Productos", icon: ChefHat, group: "operaciones" },
    { id: "guia-calculos", label: "Guía de Cálculos", icon: BookOpen, group: "sistema" },
    { id: "datos-respaldos", label: "Datos y Respaldos", icon: Database, group: "sistema" },
  ]

  // Extraer iniciales del email
  const getInitialsFromEmail = (email: string): string => {
    const username = email.split("@")[0]
    if (username.length >= 2) {
      return username.substring(0, 2).toUpperCase()
    }
    return username.charAt(0).toUpperCase() + "U"
  }

  const handleSignOut = async () => {
    const confirmed = await confirm({
      title: "Cerrar Sesión",
      description: "¿Estás seguro de que quieres cerrar sesión?",
      confirmText: "Cerrar Sesión",
      cancelText: "Cancelar",
      variant: "default",
      icon: "logout",
    })

    if (confirmed) {
      await signOut()
      toast.success("Sesión cerrada exitosamente")
    }
  }

  const renderGroupTitle = (group: string) => {
    if (isCollapsed) return null

    const titles = {
      operaciones: "Operaciones",
      sistema: "Sistema",
    }

    return (
      <div className="py-2 text-xs font-normal text-gray-500 tracking-wider">
        {titles[group as keyof typeof titles]}
      </div>
    )
  }

  const renderMenuItems = () => {
    const groups = ["dashboard", "operaciones", "sistema"]

    return groups.map((group) => {
      const groupItems =
        group === "dashboard"
          ? menuItems.filter((item) => item.group === null)
          : menuItems.filter((item) => item.group === group)

      if (groupItems.length === 0) return null

      return (
        <div key={group}>
          {group !== "dashboard" && renderGroupTitle(group)}
          <div className={`${group !== "dashboard" ? "space-y-1 mb-4" : "space-y-1 mb-6"}`}>
            {groupItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="relative">
                  <Button
                    variant={activeView === item.id ? "default" : "ghost"}
                    className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} transition-all duration-200`}
                    onClick={() => setActiveView(item.id)}
                    title={item.label}
                  >
                    <Icon className={`h-4 w-4 ${!isCollapsed ? "mr-2" : ""}`} />
                    {!isCollapsed && item.label}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )
    })
  }

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-72"} bg-white shadow-lg border-r transition-all duration-300 flex flex-col`}
    >
      {/* Header con botón de colapsar */}
      <div className="p-6 flex items-center justify-between">
        <div className={`${isCollapsed ? "hidden" : "block"}`}>
          <h1 className="text-xl font-bold text-gray-800">MdR</h1>
          <p className="text-sm text-gray-600">Matriz de Rentabilidad</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 h-auto hover:bg-gray-100 transition-all duration-200 ${isCollapsed ? "w-full justify-center" : ""}`}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navegación */}
      <nav className="p-4 flex-1">{renderMenuItems()}</nav>

      {/* Información del usuario y controles */}
      <div className="p-4 space-y-3">
        {/* Información del usuario */}
        {user && (
          <div className={`${isCollapsed ? "flex justify-center" : "block"}`}>
            {isCollapsed ? (
              <div
                className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium"
                title={user.email}
              >
                {getInitialsFromEmail(user.email)}
              </div>
            ) : (
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {getInitialsFromEmail(user.email)}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-sm text-gray-700 font-medium truncate">{user.email}</div>
                  <div className="text-xs text-gray-600">Plan Básico</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de logout */}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-200 justify-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        )}

        {isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-center p-2 hover:bg-gray-100 text-gray-700 hover:text-gray-800 transition-all duration-200"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}

        {/* Leyenda de versión */}
        {!isCollapsed && <div className="text-xs text-gray-500 text-center pt-2">MDR v0.1 © 2025</div>}
      </div>
    </div>
  )
}
