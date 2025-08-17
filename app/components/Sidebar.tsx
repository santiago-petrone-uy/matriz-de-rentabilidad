"use client"

import { useState } from "react"
import {
  Home,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { useAuth } from "../components/auth/AuthProvider"
import { useConfirm } from "../hooks/useConfirm"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Inicio", icon: Home },
  { id: "insumos", label: "Materias Primas", icon: Package },
  { id: "productos", label: "Productos", icon: ShoppingCart },
  { id: "configuracion-costos", label: "Configuración de Costos", icon: Settings },
  { id: "documentacion", label: "Documentación", icon: FileText },
  { id: "datos-respaldos", label: "Datos y Respaldos", icon: Database },
]

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, signOut } = useAuth()
  const confirm = useConfirm()

  const handleSignOut = async () => {
    const confirmed = await confirm({
      title: "Cerrar Sesión",
      message: "¿Estás seguro de que quieres cerrar sesión?",
      confirmText: "Cerrar Sesión",
      cancelText: "Cancelar",
    })

    if (confirmed) {
      try {
        await signOut()
        // Simple alert instead of toast
        alert("Sesión cerrada correctamente")
      } catch (error) {
        console.error("Error al cerrar sesión:", error)
        alert("Error al cerrar sesión")
      }
    }
  }

  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <TooltipProvider>
      <div
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">MdR</h1>
              <p className="text-sm text-gray-600">Matriz de Rentabilidad</p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{isCollapsed ? "Expandir menú" : "Colapsar menú"}</TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <li key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                          isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                      </button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 space-y-3">
          {user && (
            <>
              {!isCollapsed ? (
                <div className="flex items-center space-x-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {getInitials(user.email)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">{user.email}</TooltipContent>
                  </Tooltip>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 font-medium truncate">{user.email}</div>
                    <div className="text-xs text-gray-600">Plan Básico</div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {getInitials(user.email)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="text-center">
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-gray-600">Plan Básico</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center ${
                  isCollapsed ? "justify-center" : "justify-center space-x-2"
                }`}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Cerrar Sesión</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Cerrar Sesión</TooltipContent>}
          </Tooltip>

          <div className="text-center text-xs text-gray-500">MDR v0.1 © 2025</div>
        </div>
      </div>
    </TooltipProvider>
  )
}
