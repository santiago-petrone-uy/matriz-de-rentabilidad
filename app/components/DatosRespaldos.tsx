"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, Shield, CheckCircle, AlertCircle, RotateCcw, Heart } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { useConfirm } from "../hooks/useConfirm"
import { toast } from "sonner"

export function DatosRespaldos() {
  const {
    configuracion,
    insumos,
    productosBase,
    lotes,
    setConfiguracion,
    setInsumos,
    setProductosBase,
    setLotes,
    eliminarTodosLosDatos,
    loading,
    error,
  } = useAppContext()
  const { confirm } = useConfirm()

  const exportarDatos = () => {
    try {
      const exportData = {
        version: "3.0.0",
        exportDate: new Date().toISOString(),
        appName: "Matriz de Rentabilidad - Sin TACC",
        data: {
          configuracion,
          insumos,
          productosBase,
          lotes,
        },
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `mi-negocio-sin-tacc-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("¡Listo! Tu información se descargó correctamente", {
        description: "Guardá este archivo en un lugar seguro como respaldo",
      })
    } catch (error) {
      toast.error("No se pudo descargar tu información")
      console.error(error)
    }
  }

  const importarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        if (!importedData.data) {
          throw new Error("El archivo no es válido")
        }

        // Importar datos
        if (importedData.data.configuracion) {
          await setConfiguracion(importedData.data.configuracion)
        }
        if (importedData.data.insumos && Array.isArray(importedData.data.insumos)) {
          await setInsumos(importedData.data.insumos)
        }
        if (importedData.data.productosBase && Array.isArray(importedData.data.productosBase)) {
          await setProductosBase(importedData.data.productosBase)
        }
        if (importedData.data.lotes && Array.isArray(importedData.data.lotes)) {
          await setLotes(importedData.data.lotes)
        }

        toast.success("¡Perfecto! Tu información se recuperó exitosamente", {
          description: "Todas tus recetas y costos están de vuelta",
        })
      } catch (error) {
        toast.error("El archivo no se pudo leer correctamente", {
          description: "Asegurate de que sea un archivo descargado desde esta aplicación",
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const limpiarTodosDatos = async () => {
    const confirmed = await confirm({
      title: "¿Eliminar toda tu información?",
      description:
        "Esto borrará todas tus recetas, costos y materias primas de forma permanente de la base de datos. No se puede deshacer.",
      confirmText: "Sí, eliminar todo",
      cancelText: "No, mantener mi información",
      variant: "destructive",
      icon: "delete",
    })

    if (confirmed) {
      await eliminarTodosLosDatos()
    }
  }

  const formatearFechaAmigable = (fecha: string) => {
    try {
      const ahora = new Date()
      const fechaObj = new Date(fecha)
      const diferencia = ahora.getTime() - fechaObj.getTime()
      const minutos = Math.floor(diferencia / (1000 * 60))

      if (minutos < 1) return "recién"
      if (minutos < 60) return `hace ${minutos} minuto${minutos > 1 ? "s" : ""}`

      const horas = Math.floor(minutos / 60)
      if (horas < 24) return `hace ${horas} hora${horas > 1 ? "s" : ""}`

      const dias = Math.floor(horas / 24)
      if (dias < 7) return `hace ${dias} día${dias > 1 ? "s" : ""}`

      return fechaObj.toLocaleDateString("es-AR")
    } catch {
      return "hace un momento"
    }
  }

  // Obtener la fecha más reciente de cualquier cambio
  const obtenerUltimaActividad = () => {
    const fechas = []

    if (insumos.length > 0) {
      fechas.push(...insumos.map((i) => i.fechaAgregado))
    }
    if (productosBase.length > 0) {
      fechas.push(...productosBase.map((p) => p.fechaCreacion))
    }
    if (lotes.length > 0) {
      fechas.push(...lotes.map((l) => l.fechaCreacion))
    }

    if (fechas.length === 0) return "nunca"

    const fechaMasReciente = fechas.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    return formatearFechaAmigable(fechaMasReciente)
  }

  const ultimaActividad = obtenerUltimaActividad()
  const tieneInformacion = insumos.length > 0 || productosBase.length > 0 || lotes.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Negocio Seguro</h1>
        <p className="text-gray-600">Tu información está protegida y siempre disponible</p>
      </div>

      {/* Estado de Mi Negocio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Estado de Mi Negocio
          </CardTitle>
          <CardDescription>Tu información está segura y podés acceder desde cualquier dispositivo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Indicador principal */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">Tu información está segura</div>
                <div className="text-sm text-green-700">
                  {tieneInformacion
                    ? `Última actualización: ${ultimaActividad}`
                    : "Comenzá agregando tus primeras recetas"}
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de información - CAMBIADO A ESCALA DE GRISES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{productosBase.length}</div>
              <div className="text-sm text-gray-600">Recetas guardadas</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{insumos.length}</div>
              <div className="text-sm text-gray-600">Materias primas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{lotes.length}</div>
              <div className="text-sm text-gray-600">Lotes producidos</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                <Heart className="h-8 w-8 mx-auto" />
              </div>
              <div className="text-sm text-gray-600">Todo funcionando</div>
            </div>
          </div>

          {/* Estado de carga y errores */}
          {loading && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                🔄 <strong>Guardando...</strong> Estamos actualizando tu información.
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-800">
                ⚠️ <strong>Problema de conexión:</strong> {error}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Copia de Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Copia de Seguridad
          </CardTitle>
          <CardDescription>Descargá un archivo con todas tus recetas y costos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Descargar mi información</div>
                <div className="text-sm text-gray-600">Un archivo con todas tus recetas, costos y materias primas</div>
              </div>
              <Button onClick={exportarDatos} className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Descargar Todo
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2 p-4 bg-blue-50 rounded-lg">
            <p>
              <strong>💡 Consejo:</strong> Guardá este archivo en tu computadora, Google Drive o donde tengas tus
              documentos importantes.
            </p>
            <p>
              <strong>📱 Tranquilidad:</strong> Si se te rompe el celular o cambiás de dispositivo, podés recuperar todo
              fácilmente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recuperar Información */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Recuperar Información
          </CardTitle>
          <CardDescription>Subí un archivo para recuperar tus recetas y costos guardados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Subir información guardada</div>
                <div className="text-sm text-gray-600">
                  Recuperá tu información desde un archivo descargado anteriormente
                </div>
              </div>
              <div>
                <input type="file" accept=".json" onChange={importarDatos} className="hidden" id="import-file" />
                <Button asChild variant="outline" className="bg-transparent">
                  <label htmlFor="import-file" className="flex items-center cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar Archivo
                  </label>
                </Button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2 p-4 bg-yellow-50 rounded-lg">
            <p>
              <strong>🔄 ¿Cambiaste de dispositivo?</strong> Usá esta opción para traer toda tu información al nuevo
              dispositivo.
            </p>
            <p>
              <strong>⚠️ Importante:</strong> Solo funcionan archivos descargados desde esta aplicación.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Emergencia - Solo mostrar si tiene información */}
      {tieneInformacion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              En Caso de Emergencia
            </CardTitle>
            <CardDescription>Si necesitás empezar de cero o algo salió mal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-red-900">Eliminar toda mi información</div>
                  <div className="text-sm text-red-700">
                    Borrará todas tus recetas, costos y materias primas permanentemente de la base de datos
                  </div>
                </div>
                <Button onClick={limpiarTodosDatos} variant="destructive" size="sm" disabled={loading}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {loading ? "Eliminando..." : "Empezar de Cero"}
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-2 p-4 bg-gray-50 rounded-lg">
              <p>
                <strong>⚠️ Cuidado:</strong> Esta acción elimina permanentemente todos los datos de la base de datos.
              </p>
              <p>
                <strong>💡 Recomendación:</strong> Antes de eliminar todo, descargá una copia de seguridad por las
                dudas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje motivacional para nuevos usuarios */}
      {!tieneInformacion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              ¡Bienvenido/a a tu Matriz de Rentabilidad!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-gray-600 space-y-3">
                <p>
                  <strong>🍰 Tu emprendimiento gastronómico merece crecer</strong>
                </p>
                <p>
                  Comenzá agregando tus costos indirectos y materias primas para calcular el precio real de tus
                  productos.
                </p>
                <p className="text-sm">Toda tu información se guarda automáticamente y está siempre disponible.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
