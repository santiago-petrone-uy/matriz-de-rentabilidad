"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, Trash2, Shield, Clock, Database, RotateCcw } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { DataManager } from "../utils/dataManager"
import { toast } from "sonner"
import { useState } from "react"

export function ExportarDatos() {
  const { configuracion, insumos, productos, setConfiguracion, setInsumos, setProductos, systemInfo } = useAppContext()
  const [backups, setBackups] = useState(DataManager.getAvailableBackups())

  const exportarDatos = () => {
    try {
      const dataStr = DataManager.exportAllData()
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `matriz-rentabilidad-sin-tacc-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Datos exportados exitosamente con respaldo completo")
    } catch (error) {
      toast.error("Error al exportar los datos")
      console.error(error)
    }
  }

  const importarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const success = DataManager.importData(e.target?.result as string)

        if (success) {
          // Recargar datos en el contexto
          window.location.reload()
          toast.success("Datos importados exitosamente. La página se recargará.")
        } else {
          toast.error("Error al importar los datos. Verifica que el archivo sea válido.")
        }
      } catch (error) {
        toast.error("Error al procesar el archivo de importación")
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const limpiarTodosDatos = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar TODOS los datos? Se creará un backup automático antes de proceder.",
      )
    ) {
      // Crear backup antes de limpiar
      DataManager.createBackup()

      setConfiguracion({
        valorHoraProduccion: 0,
        costosIndirectosMensuales: 0,
        horasProduccionMensuales: 0,
      })
      setInsumos([])
      setProductos([])

      setBackups(DataManager.getAvailableBackups())
      toast.success("Todos los datos han sido eliminados. Backup creado automáticamente.")
    }
  }

  const restaurarBackup = (backupKey: string) => {
    if (window.confirm("¿Estás seguro de que quieres restaurar este backup? Los datos actuales se perderán.")) {
      const success = DataManager.restoreFromBackup(backupKey)
      if (success) {
        window.location.reload()
        toast.success("Backup restaurado exitosamente. La página se recargará.")
      } else {
        toast.error("Error al restaurar el backup")
      }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Estado del Sistema
          </CardTitle>
          <CardDescription>Información sobre la protección y versión de tus datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemInfo.version}</div>
              <div className="text-sm text-gray-600">Versión Actual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemInfo.totalBackups}</div>
              <div className="text-sm text-gray-600">Backups Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{systemInfo.dataSize}</div>
              <div className="text-sm text-gray-600">Tamaño de Datos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{insumos.length + productos.length}</div>
              <div className="text-sm text-gray-600">Total Registros</div>
            </div>
          </div>

          {systemInfo.lastBackup && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center text-green-700">
                <Clock className="mr-2 h-4 w-4" />
                <span className="text-sm">Último backup: {formatDate(systemInfo.lastBackup)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestión de Datos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Gestión de Datos
          </CardTitle>
          <CardDescription>Exporta, importa o limpia todos los datos de la aplicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={exportarDatos} className="flex items-center justify-center">
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>

            <div>
              <input type="file" accept=".json" onChange={importarDatos} className="hidden" id="import-file" />
              <Button asChild variant="outline" className="w-full">
                <label htmlFor="import-file" className="flex items-center justify-center cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Datos
                </label>
              </Button>
            </div>

            <Button onClick={limpiarTodosDatos} variant="destructive" className="flex items-center justify-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar Todo
            </Button>
          </div>

          <div className="text-sm text-gray-600 space-y-2 p-4 bg-blue-50 rounded-lg">
            <p>
              <strong>🔒 Protección Automática:</strong> Cada cambio crea un backup automático.
            </p>
            <p>
              <strong>🔄 Migración Automática:</strong> Tus datos se actualizan automáticamente a nuevas versiones.
            </p>
            <p>
              <strong>💾 Persistencia Garantizada:</strong> Nunca perderás tu información, sin importar las
              actualizaciones.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Backups Disponibles */}
      {backups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RotateCcw className="mr-2 h-5 w-5" />
              Backups Disponibles
            </CardTitle>
            <CardDescription>Restaura tu información desde backups automáticos anteriores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backups.slice(0, 5).map((backup) => (
                <div key={backup.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{formatDate(backup.date)}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {backup.version}
                      </Badge>
                      Backup automático
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => restaurarBackup(backup.key)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restaurar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
