"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { BaseModal } from "@/components/ui/BaseModal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CurrencyInput, IntegerInput, QuantityInput } from "@/components/ui/numeric-inputs"
import { Plus, Trash2, Edit, Package } from "lucide-react"
import { useAppContext, type Insumo } from "../context/AppContext"
import { useConfirm } from "../hooks/useConfirm"
import { toast } from "sonner"
import { useUnsavedChanges } from "../hooks/useUnsavedChanges"

interface InsumosProps {
  onPendingChanges?: (hasChanges: boolean) => void
}

export function Insumos({ onPendingChanges }: InsumosProps = {}) {
  const { insumos, agregarInsumo, editarInsumo, eliminarInsumo, productosBase, lotes, actualizarCantidadUtilizada } =
    useAppContext()
  const { confirm } = useConfirm()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    proveedor: "",
    costoCompra: 0,
    cantidadPaquetes: 1,
    cantidadCompra: 0,
    unidadCompra: "kg" as const,
  })
  const [ajustarCantidad, setAjustarCantidad] = useState(false)
  const [cantidadActual, setCantidadActual] = useState(0)

  // Función para detectar cambios en el formulario
  const hayDatosIngresados = () => {
    if (!insumoEditando) {
      // CREAR NUEVO: Detectar cualquier campo con contenido
      const hayNombre = formData.nombre.trim() !== ""
      const hayProveedor = formData.proveedor.trim() !== ""
      const hayCosto = formData.costoCompra > 0
      const hayCantidadPaquetes = formData.cantidadPaquetes !== 1
      const hayCantidadCompra = formData.cantidadCompra > 0
      const hayUnidadCambiada = formData.unidadCompra !== "kg"
      const hayToggleActivado = ajustarCantidad
      const hayCantidadActual = cantidadActual > 0

      return (
        hayNombre ||
        hayProveedor ||
        hayCosto ||
        hayCantidadPaquetes ||
        hayCantidadCompra ||
        hayUnidadCambiada ||
        hayToggleActivado ||
        hayCantidadActual
      )
    } else {
      // EDITAR: Comparar vs datos originales del insumo
      const nombreCambiado = formData.nombre.trim() !== insumoEditando.nombre
      const proveedorCambiado = formData.proveedor.trim() !== (insumoEditando.proveedor || "")
      const costoCambiado = Math.abs(formData.costoCompra - insumoEditando.costoCompra) > 0.01
      const cantidadPaquetesCambiada = formData.cantidadPaquetes !== insumoEditando.cantidadPaquetes
      const cantidadCompraCambiada = Math.abs(formData.cantidadCompra - insumoEditando.cantidadCompra) > 0.01
      const unidadCambiada = formData.unidadCompra !== insumoEditando.unidadCompra

      // Para toggle, considerar cambio si está activado (independiente del estado original)
      const hayToggleActivado = ajustarCantidad

      // Para cantidad actual, verificar si hay valor cuando toggle está activado
      const hayCantidadActual = ajustarCantidad && cantidadActual > 0

      return (
        nombreCambiado ||
        proveedorCambiado ||
        costoCambiado ||
        cantidadPaquetesCambiada ||
        cantidadCompraCambiada ||
        unidadCambiada ||
        hayToggleActivado ||
        hayCantidadActual
      )
    }
  }

  // Hook para protección de navegación
  const { confirmNavigation } = useUnsavedChanges(
    hayDatosIngresados(),
    "Se perderán los cambios realizados en el insumo. ¿Estás seguro de que quieres salir?",
  )

  // Reportar cambios al componente padre
  useEffect(() => {
    if (onPendingChanges) {
      onPendingChanges(hayDatosIngresados())
    }
  }, [formData, ajustarCantidad, cantidadActual, insumoEditando, onPendingChanges])

  useEffect(() => {
    if (!isModalOpen && onPendingChanges) {
      onPendingChanges(false)
    }
  }, [isModalOpen, onPendingChanges])

  const resetForm = () => {
    setFormData({
      nombre: "",
      proveedor: "",
      costoCompra: 0,
      cantidadPaquetes: 1,
      cantidadCompra: 0,
      unidadCompra: "kg",
    })
    setInsumoEditando(null)
    setAjustarCantidad(false)
    setCantidadActual(0)

    // Limpiar reporte de cambios
    if (onPendingChanges) {
      onPendingChanges(false)
    }
  }

  const abrirModalEditar = (insumo: Insumo) => {
    setFormData({
      nombre: insumo.nombre,
      proveedor: insumo.proveedor || "",
      costoCompra: insumo.costoCompra,
      cantidadPaquetes: insumo.cantidadPaquetes,
      cantidadCompra: insumo.cantidadCompra,
      unidadCompra: insumo.unidadCompra,
    })
    setInsumoEditando(insumo)

    // Para edición, verificar si ya tiene cantidad utilizada
    if (insumo.cantidadUtilizada > 0) {
      setAjustarCantidad(true)
      // Calcular cantidad actual basada en la utilizada
      const cantidadTotal = insumo.cantidadPaquetes * insumo.cantidadCompra
      let cantidadTotalEnUnidadMinima = cantidadTotal
      if (insumo.unidadCompra === "kg") cantidadTotalEnUnidadMinima = cantidadTotal * 1000
      if (insumo.unidadCompra === "l") cantidadTotalEnUnidadMinima = cantidadTotal * 1000

      const cantidadActualCalculada = cantidadTotalEnUnidadMinima - insumo.cantidadUtilizada

      // Convertir de vuelta a la unidad original
      let cantidadEnUnidadOriginal = cantidadActualCalculada
      if (insumo.unidadCompra === "kg") cantidadEnUnidadOriginal = cantidadActualCalculada / 1000
      if (insumo.unidadCompra === "l") cantidadEnUnidadOriginal = cantidadActualCalculada / 1000

      setCantidadActual(cantidadEnUnidadOriginal)
    } else {
      setAjustarCantidad(false)
      setCantidadActual(0)
    }

    setIsModalOpen(true)
  }

  const abrirModalNuevo = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cantidadTotal = formData.cantidadPaquetes * formData.cantidadCompra

    if (
      !formData.nombre ||
      formData.costoCompra <= 0 ||
      formData.cantidadPaquetes <= 0 ||
      formData.cantidadCompra <= 0
    ) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    if (ajustarCantidad && cantidadActual < 0) {
      toast.error("La cantidad actual no puede ser negativa")
      return
    }

    if (ajustarCantidad && cantidadActual > cantidadTotal) {
      toast.error("La cantidad actual no puede ser mayor a la cantidad comprada")
      return
    }

    // Calcular cantidad utilizada si se está ajustando
    let cantidadUtilizada = 0
    if (ajustarCantidad) {
      const cantidadUsada = cantidadTotal - cantidadActual

      // Convertir a unidad mínima para el cálculo
      if (formData.unidadCompra === "kg") {
        cantidadUtilizada = cantidadUsada * 1000
      } else if (formData.unidadCompra === "l") {
        cantidadUtilizada = cantidadUsada * 1000
      } else {
        cantidadUtilizada = cantidadUsada
      }
    }

    if (insumoEditando) {
      editarInsumo(insumoEditando.id, formData)

      // Si se está ajustando cantidad, actualizar la cantidad utilizada
      if (ajustarCantidad) {
        const diferencia = cantidadUtilizada - insumoEditando.cantidadUtilizada
        actualizarCantidadUtilizada(insumoEditando.id, diferencia)
      }

      toast.success("Materia prima actualizada exitosamente")
    } else {
      // Para nuevo insumo, pasar la cantidad utilizada calculada
      agregarInsumo({
        ...formData,
        cantidadUtilizada,
      })
      toast.success("Materia prima agregada exitosamente")
    }

    resetForm()
    setIsModalOpen(false)
  }

  const handleEliminar = async (insumo: Insumo) => {
    const confirmed = await confirm({
      title: `Eliminar "${insumo.nombre}"`,
      description: "Esta acción eliminará la materia prima de forma permanente. No se puede deshacer.",
      confirmText: "Eliminar materia prima",
      cancelText: "Mantener materia prima",
      variant: "destructive",
      icon: "delete",
    })

    if (confirmed) {
      eliminarInsumo(insumo.id)
      toast.success("Insumo eliminado exitosamente")
    }
  }

  const getUnidadMinima = (unidad: string) => {
    switch (unidad) {
      case "kg":
        return "g"
      case "g":
        return "g"
      case "l":
        return "ml"
      case "ml":
        return "ml"
      case "unidades":
        return "ud"
      default:
        return "g"
    }
  }

  const calcularPorcentajeUtilizado = (insumo: Insumo): number => {
    const cantidadTotal = insumo.cantidadPaquetes * insumo.cantidadCompra
    let cantidadTotalEnUnidadMinima = cantidadTotal

    if (insumo.unidadCompra === "kg") cantidadTotalEnUnidadMinima = cantidadTotal * 1000
    if (insumo.unidadCompra === "l") cantidadTotalEnUnidadMinima = cantidadTotal * 1000

    return Math.min(100, (insumo.cantidadUtilizada / cantidadTotalEnUnidadMinima) * 100)
  }

  const formatearFechaRelativa = (fechaISO: string): { relativa: string; exacta: string } => {
    try {
      const fecha = new Date(fechaISO)
      const ahora = new Date()
      const diferencia = ahora.getTime() - fecha.getTime()

      const segundos = Math.floor(diferencia / 1000)
      const minutos = Math.floor(segundos / 60)
      const horas = Math.floor(minutos / 60)
      const dias = Math.floor(horas / 24)
      const semanas = Math.floor(dias / 7)
      const meses = Math.floor(dias / 30)
      const años = Math.floor(dias / 365)

      let relativa = ""
      if (años > 0) {
        relativa = `Hace ${años} año${años > 1 ? "s" : ""}`
      } else if (meses > 0) {
        relativa = `Hace ${meses} mes${meses > 1 ? "es" : ""}`
      } else if (semanas > 0) {
        relativa = `Hace ${semanas} semana${semanas > 1 ? "s" : ""}`
      } else if (dias > 0) {
        relativa = `Hace ${dias} día${dias > 1 ? "s" : ""}`
      } else if (horas > 0) {
        relativa = `Hace ${horas} hora${horas > 1 ? "s" : ""}`
      } else if (minutos > 0) {
        relativa = `Hace ${minutos} minuto${minutos > 1 ? "s" : ""}`
      } else {
        relativa = "Hace unos segundos"
      }

      const exacta = fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      return { relativa, exacta }
    } catch {
      return { relativa: "N/A", exacta: "Fecha inválida" }
    }
  }

  const getTituloModal = () => {
    return insumoEditando ? "Editar Materia Prima" : "Agregar Nueva Materia Prima"
  }

  const getSubtituloModal = () => {
    return insumoEditando
      ? `Modifica la información de "${insumoEditando.nombre}"`
      : "Completa la información de la nueva materia prima para agregarla a tu inventario"
  }

  const verificarInsumoEnUso = (insumoId: string) => {
    const productosQueUsan: string[] = []
    const lotesQueUsan: string[] = []

    // Verificar en productos base
    productosBase.forEach((producto) => {
      const usaInsumo = producto.receta.some((ingrediente) => ingrediente.insumoId === insumoId)
      if (usaInsumo) {
        productosQueUsan.push(producto.nombre)
      }
    })

    // Verificar en lotes
    lotes.forEach((lote) => {
      const usaInsumo = lote.recetaUsada.some((ingrediente) => ingrediente.insumoId === insumoId)
      if (usaInsumo) {
        const productoBase = productosBase.find((pb) => pb.id === lote.productoBaseId)
        if (productoBase) {
          const identificador = `${productoBase.nombre} (Lote ${lote.numeroLote})`
          if (!lotesQueUsan.includes(identificador)) {
            lotesQueUsan.push(identificador)
          }
        }
      }
    })

    return {
      enUso: productosQueUsan.length > 0 || lotesQueUsan.length > 0,
      productos: productosQueUsan,
      lotes: lotesQueUsan,
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Materias Primas</h1>
            <p className="text-gray-600">Administra tu inventario de materias primas</p>
          </div>

          <Button onClick={abrirModalNuevo}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Materia Prima
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Inventario de Materias Primas
            </CardTitle>
            <CardDescription>Todas tus materias primas registradas con control de stock y consumo</CardDescription>
          </CardHeader>
          <CardContent>
            {insumos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay materias primas registradas</p>
                <p className="text-sm text-gray-400">Agrega tu primera materia prima para comenzar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="align-middle">Nombre de la Materia Prima</TableHead>
                      <TableHead className="align-middle">Proveedor</TableHead>
                      <TableHead className="align-middle">Costo Total</TableHead>
                      <TableHead className="align-middle">Cantidad Comprada</TableHead>
                      <TableHead className="align-middle">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">CUN</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Costo Unitario Normalizado</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                      <TableHead className="align-middle">Cantidad Utilizada</TableHead>
                      <TableHead className="align-middle">Agregado</TableHead>
                      <TableHead className="align-middle">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insumos.map((insumo) => {
                      const cantidadTotal = insumo.cantidadPaquetes * insumo.cantidadCompra
                      const porcentajeUtilizado = calcularPorcentajeUtilizado(insumo)
                      const { relativa, exacta } = formatearFechaRelativa(insumo.fechaAgregado)

                      return (
                        <TableRow key={insumo.id} className="align-top">
                          <TableCell className="font-medium align-top">{insumo.nombre}</TableCell>
                          <TableCell className="align-top">{insumo.proveedor || "-"}</TableCell>
                          <TableCell className="align-top">${insumo.costoCompra.toFixed(2)}</TableCell>
                          <TableCell className="align-top">
                            <div>
                              <span className="font-medium">
                                {cantidadTotal} {insumo.unidadCompra}
                              </span>
                              <br />
                              <span className="text-xs text-gray-500">
                                ({insumo.cantidadPaquetes} unidad{insumo.cantidadPaquetes !== 1 ? "es" : ""} ×{" "}
                                {insumo.cantidadCompra} {insumo.unidadCompra})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            ${insumo.costoUnitarioNormalizado.toFixed(4)} / {getUnidadMinima(insumo.unidadCompra)}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-2 min-w-[120px]">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {insumo.cantidadUtilizada.toFixed(1)} {getUnidadMinima(insumo.unidadCompra)}
                                </span>
                                <span className="text-gray-500">{porcentajeUtilizado.toFixed(1)}%</span>
                              </div>
                              <Progress value={porcentajeUtilizado} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-sm text-gray-600">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{relativa}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{exacta}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex space-x-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => abrirModalEditar(insumo)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar materia prima</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEliminar(insumo)}
                                      disabled={verificarInsumoEnUso(insumo.id).enUso}
                                      className={`h-8 w-8 p-0 ${
                                        verificarInsumoEnUso(insumo.id).enUso
                                          ? "text-gray-400 cursor-not-allowed"
                                          : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                      }`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  {(() => {
                                    const usoInfo = verificarInsumoEnUso(insumo.id)
                                    if (!usoInfo.enUso) {
                                      return <p>Eliminar materia prima</p>
                                    }

                                    return (
                                      <div className="space-y-2">
                                        <p className="font-medium text-yellow-600">No se puede eliminar</p>
                                        <p className="text-sm">Este insumo está siendo usado en:</p>
                                        {usoInfo.productos.length > 0 && (
                                          <div>
                                            <p className="text-xs font-medium">Productos:</p>
                                            <ul className="text-xs list-disc list-inside">
                                              {usoInfo.productos.map((producto, index) => (
                                                <li key={index}>{producto}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {usoInfo.lotes.length > 0 && (
                                          <div>
                                            <p className="text-xs font-medium">Lotes:</p>
                                            <ul className="text-xs list-disc list-inside">
                                              {usoInfo.lotes.slice(0, 3).map((lote, index) => (
                                                <li key={index}>{lote}</li>
                                              ))}
                                              {usoInfo.lotes.length > 3 && (
                                                <li className="text-gray-500">y {usoInfo.lotes.length - 3} más...</li>
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">
                                          Elimina primero los productos que usan esta materia prima.
                                        </p>
                                      </div>
                                    )
                                  })()}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal para Agregar/Editar Insumo */}
        <BaseModal
          isOpen={isModalOpen}
          onClose={async () => {
            if (hayDatosIngresados()) {
              const canLeave = await confirmNavigation()
              if (canLeave) {
                setIsModalOpen(false)
                resetForm()
              }
            } else {
              setIsModalOpen(false)
              resetForm()
            }
          }}
          title={getTituloModal()}
          subtitle={getSubtituloModal()}
          primaryAction={{
            label: insumoEditando ? "Actualizar Materia Prima" : "Guardar Materia Prima",
            onClick: handleSubmit,
          }}
          secondaryAction={{
            label: "Cancelar",
            onClick: async () => {
              if (hayDatosIngresados()) {
                const canLeave = await confirmNavigation()
                if (canLeave) {
                  setIsModalOpen(false)
                  resetForm()
                }
              } else {
                setIsModalOpen(false)
                resetForm()
              }
            },
          }}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Nombre de la Materia Prima */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Materia Prima</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Fécula de mandioca"
              />
            </div>

            {/* 2. Proveedor (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="proveedor">
                Proveedor <em>(opcional)</em>
              </Label>
              <Input
                id="proveedor"
                value={formData.proveedor}
                onChange={(e) => setFormData((prev) => ({ ...prev, proveedor: e.target.value }))}
                placeholder="Ej: Distribuidora Maldonado"
              />
            </div>

            {/* 3. Unidades Compradas - fila completa */}
            <div className="space-y-2">
              <Label htmlFor="unidadesCompradas">Unidades Compradas</Label>
              <IntegerInput
                id="unidadesCompradas"
                value={formData.cantidadPaquetes}
                onChange={(value) => setFormData((prev) => ({ ...prev, cantidadPaquetes: value }))}
                placeholder="1"
                min={1}
              />
            </div>

            {/* 4. Grid: Unidad de Medida | Peso/Volumen/Unidades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidadCompra">Unidad de Medida</Label>
                <Select
                  value={formData.unidadCompra}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, unidadCompra: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilos (kg)</SelectItem>
                    <SelectItem value="g">Gramos (g)</SelectItem>
                    <SelectItem value="l">Litros (l)</SelectItem>
                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                    <SelectItem value="unidades">Unidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pesoVolumenUnidades">Peso/Volumen/Unidades</Label>
                <QuantityInput
                  id="pesoVolumenUnidades"
                  value={formData.cantidadCompra}
                  onChange={(value) => setFormData((prev) => ({ ...prev, cantidadCompra: value }))}
                  placeholder="25"
                  unit={formData.unidadCompra}
                  showUnit={false}
                />
              </div>
            </div>

            {/* 5. Toggle para ajustar cantidad */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch id="ajustar-cantidad" checked={ajustarCantidad} onCheckedChange={setAjustarCantidad} />
                <Label htmlFor="ajustar-cantidad" className="text-sm font-medium">
                  Ajustar cantidad disponible
                </Label>
              </div>

              {/* Input de cantidad actual (solo si el toggle está activado) */}
              {ajustarCantidad && (
                <div className="space-y-2">
                  <Label htmlFor="cantidadActual">Cantidad actual disponible</Label>
                  <QuantityInput
                    id="cantidadActual"
                    value={cantidadActual}
                    onChange={setCantidadActual}
                    placeholder={`Ej: ${(formData.cantidadPaquetes * formData.cantidadCompra * 0.8).toFixed(1)}`}
                    unit={formData.unidadCompra}
                  />
                  <p className="text-xs text-gray-600">
                    Ingresa la cantidad real que tienes disponible actualmente. El sistema calculará automáticamente
                    cuánto se ha utilizado.
                  </p>
                  {cantidadActual > 0 && formData.cantidadPaquetes * formData.cantidadCompra > 0 && (
                    <div className="text-xs text-gray-700 bg-gray-100 p-2 rounded">
                      <strong>Cantidad utilizada:</strong>{" "}
                      {(formData.cantidadPaquetes * formData.cantidadCompra - cantidadActual).toFixed(2)}{" "}
                      {formData.unidadCompra}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 6. Costo Total de la Compra - al final */}
            <div className="space-y-2">
              <Label htmlFor="costoCompra">Costo Total de la Compra</Label>
              <CurrencyInput
                id="costoCompra"
                value={formData.costoCompra}
                onChange={(value) => setFormData((prev) => ({ ...prev, costoCompra: value }))}
                placeholder="2125"
              />
            </div>

            {/* Resumen final - mantener igual */}
            {formData.cantidadPaquetes * formData.cantidadCompra > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Cantidad Total Comprada:</p>
                <p className="text-lg font-bold text-blue-900">
                  {formData.cantidadPaquetes * formData.cantidadCompra} {formData.unidadCompra}
                </p>
                <p className="text-xs text-blue-600">
                  ({formData.cantidadPaquetes} unidad{formData.cantidadPaquetes !== 1 ? "es" : ""} ×{" "}
                  {formData.cantidadCompra} {formData.unidadCompra})
                </p>
              </div>
            )}
          </form>
        </BaseModal>
      </div>
    </TooltipProvider>
  )
}
