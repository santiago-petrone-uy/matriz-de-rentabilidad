"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, Trash2, Shield, AlertTriangle, CheckCircle, Database, Cloud, HardDrive } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { useConfirm } from "../hooks/useConfirm"

export default function DatosRespaldos() {
  const { insumos, productosBase, lotes, configuracion, eliminarTodosLosDatos } = useAppContext()
  const confirm = useConfirm()
  const [isLoading, setIsLoading] = useState(false)

  // Calcular estadísticas
  const totalRegistros = insumos.length + productosBase.length + lotes.length
  const tamañoEstimado = Math.round(totalRegistros * 0.5) // KB estimados

  const handleExportarDatos = () => {
    try {
      const datos = {
        insumos,
        productosBase,
        lotes,
        configuracion,
        exportadoEn: new Date().toISOString(),
        version: "1.0",
      }

      const blob = new Blob([JSON.stringify(datos, null, 2)], {
        type: "application/json",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `matriz-rentabilidad-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert("Datos exportados correctamente")
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al exportar los datos")
    }
  }

  const handleImportarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const datos = JSON.parse(e.target?.result as string)

        // Aquí podrías implementar la lógica de importación
        console.log("Datos a importar:", datos)
        alert("Función de importación en desarrollo")
      } catch (error) {
        console.error("Error al importar:", error)
        alert("Error: Archivo no válido")
      }
    }
    reader.readAsText(file)
  }

  const limpiarTodosDatos = async () => {
    const confirmed = await confirm({
      title: "⚠️ ELIMINAR TODOS LOS DATOS",
      message:
        "Esta acción eliminará PERMANENTEMENTE todos tus datos de la base de datos:\n\n• Todas las materias primas\n• Todos los productos\n• Todos los lotes\n• Toda la configuración\n\n¿Estás completamente seguro? Esta acción NO se puede deshacer.",
      confirmText: "SÍ, ELIMINAR TODO",
      cancelText: "Cancelar",
    })

    if (confirmed) {
      setIsLoading(true)
      try {
        await eliminarTodosLosDatos()
        alert("Todos los datos han sido eliminados de la base de datos")
      } catch (error) {
        console.error("Error al eliminar datos:", error)
        alert("Error al eliminar los datos: " + (error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Datos y Respaldos</h1>
        <p className="text-gray-600 mt-2">Gestiona la seguridad y respaldo de tu información empresarial</p>
      </div>

      {/* Estado Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Estado de tus Datos</span>
          </CardTitle>
          <CardDescription>Información actual almacenada en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700">{totalRegistros}</div>
                  <div className="text-sm text-blue-600">Registros Totales</div>
                </div>
                <HardDrive className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-700">{tamañoEstimado} KB</div>
                  <div className="text-sm text-green-600">Tamaño Estimado</div>
                </div>
                <Cloud className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-700">{totalRegistros > 0 ? "Activo" : "Vacío"}</div>
                  <div className="text-sm text-purple-600">Estado</div>
                </div>
                {totalRegistros > 0 ? (
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-purple-600" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Desglose de Información:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Materias Primas:</span>
                <Badge variant="outline" className="ml-2">
                  {insumos.length}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Productos:</span>
                <Badge variant="outline" className="ml-2">
                  {productosBase.length}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Lotes:</span>
                <Badge variant="outline" className="ml-2">
                  {lotes.length}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Configuración:</span>
                <Badge variant="outline" className="ml-2">
                  {configuracion ? "1" : "0"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones de Respaldo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Proteger mis Datos</span>
            </CardTitle>
            <CardDescription>Crea copias de seguridad de tu información</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExportarDatos} className="w-full" disabled={totalRegistros === 0}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Respaldo Completo
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportarDatos}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Restaurar desde Archivo
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• El respaldo incluye todos tus datos</p>
              <p>• Formato JSON compatible</p>
              <p>• Recomendado: respaldo semanal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Zona de Riesgo</span>
            </CardTitle>
            <CardDescription>Acciones que requieren precaución extrema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">En caso de emergencia</h4>
              <p className="text-sm text-red-700 mb-3">
                Esta acción eliminará PERMANENTEMENTE todos tus datos de la base de datos. No se puede deshacer.
              </p>
              <Button variant="destructive" onClick={limpiarTodosDatos} disabled={isLoading} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                {isLoading ? "Eliminando..." : "Eliminar Todos los Datos"}
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>⚠️ Acción irreversible</p>
              <p>⚠️ Requiere confirmación</p>
              <p>⚠️ Haz respaldo antes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Seguridad</CardTitle>
          <CardDescription>Cómo protegemos tu información</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Almacenamiento Seguro</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Datos encriptados en tránsito y reposo</li>
                <li>• Servidores seguros con certificación</li>
                <li>• Respaldos automáticos diarios</li>
                <li>• Acceso protegido por autenticación</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recomendaciones</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Descarga respaldos regularmente</li>
                <li>• Mantén contraseñas seguras</li>
                <li>• Cierra sesión en dispositivos compartidos</li>
                <li>• Reporta actividad sospechosa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
