"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BaseModal } from "@/components/ui/BaseModal"
import { CurrencyInput, IntegerInput, TimeInput, QuantityInput } from "@/components/ui/numeric-inputs"
import {
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Copy,
  Info,
  DollarSign,
  ChefHat,
  Calculator,
  ExternalLink,
  Clock,
} from "lucide-react"
import { useAppContext, type IngredienteReceta, type ProductoBase } from "../context/AppContext"
import { useConfirm } from "../hooks/useConfirm"
import { useUnsavedChanges } from "../hooks/useUnsavedChanges"
import { toast } from "sonner"

interface ProductosProps {
  onPendingChanges?: (hasChanges: boolean) => void
}

export function Productos({ onPendingChanges }: ProductosProps = {}) {
  const {
    productosBase,
    lotes,
    insumos,
    configuracion,
    crearProducto,
    repetirProducto,
    editarProductoBase,
    eliminarProductoBase,
    obtenerLotesPorProducto,
    obtenerUltimoLote,
  } = useAppContext()

  const { confirm } = useConfirm()

  const [vista, setVista] = useState<"lista" | "crear" | "historial">("lista")
  const [productoBaseEditando, setProductoBaseEditando] = useState<ProductoBase | null>(null)
  const [productoBaseRepitiendo, setProductoBaseRepitiendo] = useState<ProductoBase | null>(null)
  const [productoBaseHistorial, setProductoBaseHistorial] = useState<ProductoBase | null>(null)

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

  const repetirProductoBase = (productoBase: ProductoBase) => {
    setProductoBaseRepitiendo(productoBase)
    setVista("crear")
  }

  const editarProducto = (productoBase: ProductoBase) => {
    setProductoBaseEditando(productoBase)
    setVista("crear")
  }

  const verHistorial = (productoBase: ProductoBase) => {
    setProductoBaseHistorial(productoBase)
    setVista("historial")
  }

  const handleEliminarProducto = async (productoBase: ProductoBase) => {
    const confirmed = await confirm({
      title: `Eliminar "${productoBase.nombre}"`,
      description: "Esta acción eliminará el producto y todos sus lotes de forma permanente. No se puede deshacer.",
      confirmText: "Eliminar producto",
      cancelText: "Mantener producto",
      variant: "destructive",
      icon: "delete",
    })

    if (confirmed) {
      eliminarProductoBase(productoBase.id)
      toast.success("Producto eliminado exitosamente")
    }
  }

  if (vista === "crear") {
    return (
      <CrearEditarProducto
        productoBase={productoBaseEditando}
        productoBaseRepetir={productoBaseRepitiendo}
        onVolver={() => {
          setVista("lista")
          setProductoBaseEditando(null)
          setProductoBaseRepitiendo(null)
        }}
        onPendingChanges={onPendingChanges}
        onGuardar={async (datos) => {
          if (productoBaseEditando) {
            console.log("🔄 Guardando edición de producto:", datos)
            editarProductoBase(productoBaseEditando.id, {
              nombre: datos.nombre,
              receta: datos.receta,
              tiempoManoObraLote: datos.tiempoManoObraLote,
              rendimientoLote: datos.rendimientoLote,
            })

            await new Promise((resolve) => setTimeout(resolve, 200))
            toast.success("Producto actualizado exitosamente")
          } else if (productoBaseRepitiendo) {
            console.log("🔄 Creando nuevo lote:", datos)
            repetirProducto(productoBaseRepitiendo.id, {
              recetaUsada: datos.receta,
              tiempoManoObraUsado: datos.tiempoManoObraLote,
              rendimientoUsado: datos.rendimientoLote,
              margenGanancia: datos.margenGanancia,
              precioVentaFinal: datos.precioVentaFinal,
              costoTotalProduccion: datos.costoTotalProduccion,
              unidadesPorPaquete: datos.unidadesPorPaquete,
              precioVentaPorPaquete: datos.precioVentaPorPaquete,
            })

            await new Promise((resolve) => setTimeout(resolve, 200))
            toast.success("Nuevo lote creado exitosamente")
          } else {
            crearProducto(datos)
            toast.success("Producto creado exitosamente")
          }

          setVista("lista")
          setProductoBaseEditando(null)
          setProductoBaseRepitiendo(null)
        }}
      />
    )
  }

  if (vista === "historial" && productoBaseHistorial) {
    return (
      <HistorialLotes
        productoBase={productoBaseHistorial}
        onVolver={() => {
          setVista("lista")
          setProductoBaseHistorial(null)
        }}
        onEliminar={handleEliminarProducto}
      />
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Productos</h1>
            <p className="text-gray-600">Gestiona tus recetas y estrategias de precio</p>
          </div>

          <Button onClick={() => setVista("crear")}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Producto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChefHat className="mr-2 h-5 w-5" />
              Catálogo de Mis Productos
            </CardTitle>
            <CardDescription>Todos tus productos con información del último lote producido</CardDescription>
          </CardHeader>
          <CardContent>
            {productosBase.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay productos registrados</p>
                <p className="text-sm text-gray-400">Crea tu primer producto para comenzar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="align-middle">Nombre del Producto</TableHead>
                      <TableHead className="align-middle">Lote & Rendimiento</TableHead>
                      <TableHead className="align-middle">Empaques & Cantidades</TableHead>
                      <TableHead className="align-middle">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">CTP</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Costo Total de Producción</p>
                          </TooltipContent>
                        </Tooltip>{" "}
                        por Lote
                      </TableHead>
                      <TableHead className="align-middle">Precio de Venta</TableHead>
                      <TableHead className="align-middle">Margen de Ganancia</TableHead>
                      <TableHead className="align-middle">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosBase.map((productoBase) => {
                      const ultimoLote = obtenerUltimoLote(productoBase.id)
                      const totalLotes = obtenerLotesPorProducto(productoBase.id).length

                      // Cálculos según las especificaciones
                      const ctpPorLote = ultimoLote ? ultimoLote.costoTotalProduccion * ultimoLote.rendimientoUsado : 0
                      const empaques =
                        ultimoLote && ultimoLote.unidadesPorPaquete
                          ? Math.floor(ultimoLote.rendimientoUsado / ultimoLote.unidadesPorPaquete)
                          : 0
                      const precioVenta = ultimoLote?.precioVentaPorPaquete || 0

                      return (
                        <TableRow
                          key={productoBase.id}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => verHistorial(productoBase)}
                        >
                          <TableCell className="font-medium align-top">{productoBase.nombre}</TableCell>

                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                Lote {ultimoLote ? ultimoLote.numeroLote : "N/A"}
                              </div>
                              <div className="text-xs text-gray-600">
                                {ultimoLote ? ultimoLote.rendimientoUsado : productoBase.rendimientoLote} unidades
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="align-top">
                            {ultimoLote && ultimoLote.unidadesPorPaquete && ultimoLote.unidadesPorPaquete > 1 ? (
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{empaques} emp</div>
                                <div className="text-xs text-gray-600">{ultimoLote.unidadesPorPaquete} unidades</div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="font-medium text-sm">Individual</div>
                                <div className="text-xs text-gray-600">1 unidad</div>
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="align-top font-medium">${ctpPorLote.toFixed(2)}</TableCell>

                          <TableCell className="align-top font-medium">${precioVenta.toFixed(2)}</TableCell>

                          <TableCell className="align-top">
                            {ultimoLote ? `${ultimoLote.margenGanancia.toFixed(1)}%` : "N/A"}
                          </TableCell>

                          <TableCell className="align-top">
                            <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => repetirProductoBase(productoBase)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Crear nuevo lote</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editarProducto(productoBase)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar lote</p>
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
      </div>
    </TooltipProvider>
  )
}

interface CrearEditarProductoProps {
  productoBase?: ProductoBase | null
  productoBaseRepetir?: ProductoBase | null
  onVolver: () => void
  onPendingChanges?: (hasChanges: boolean) => void
  onGuardar: (datos: {
    nombre: string
    receta: IngredienteReceta[]
    tiempoManoObraLote: number
    rendimientoLote: number
    margenGanancia: number
    precioVentaFinal: number
    costoTotalProduccion: number
    unidadesPorPaquete: number
    precioVentaPorPaquete: number
  }) => void
}

function CrearEditarProducto({
  productoBase,
  productoBaseRepetir,
  onVolver,
  onPendingChanges,
  onGuardar,
}: CrearEditarProductoProps) {
  const { insumos, configuracion, agregarInsumo, obtenerUltimoLote, productosBase } = useAppContext()
  const { confirm } = useConfirm()

  // Determinar datos iniciales
  const datosIniciales = productoBase || productoBaseRepetir
  const ultimoLote = datosIniciales ? obtenerUltimoLote(datosIniciales.id) : null

  const [formData, setFormData] = useState({
    nombre: datosIniciales?.nombre || "",
    rendimientoLote: datosIniciales?.rendimientoLote || 1,
    tiempoManoObraLote: datosIniciales?.tiempoManoObraLote || 0,
  })
  const [receta, setReceta] = useState<IngredienteReceta[]>(datosIniciales?.receta || [])
  const [margenGanancia, setMargenGanancia] = useState([ultimoLote?.margenGanancia || 30])
  const [precioVentaFinal, setPrecioVentaFinal] = useState(0)

  // Estados para empaque
  const [unidadesPorPaquete, setUnidadesPorPaquete] = useState(ultimoLote?.unidadesPorPaquete || 1)

  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState("")
  const [cantidadIngrediente, setCantidadIngrediente] = useState(0)

  // Estados para modales
  const [isInsumoModalOpen, setIsInsumoModalOpen] = useState(false)
  const [isCostosModalOpen, setIsCostosModalOpen] = useState(false)
  const [formDataInsumo, setFormDataInsumo] = useState({
    nombre: "",
    proveedor: "",
    costoCompra: 0,
    cantidadPaquetes: 1,
    cantidadCompra: 0,
    unidadCompra: "kg" as const,
  })

  // Cálculos
  const costoMateriaPrimaLote = receta.reduce((total, ing) => total + ing.costo, 0)
  const costoMateriaPrimaUnidad = costoMateriaPrimaLote / (formData.rendimientoLote || 1)

  const costoManoObraLote = formData.tiempoManoObraLote * configuracion.valorHoraProduccion
  const costoManoObraUnidad = costoManoObraLote / (formData.rendimientoLote || 1)

  const tasaCIF =
    configuracion.horasProduccionMensuales > 0
      ? configuracion.costosIndirectosMensuales / configuracion.horasProduccionMensuales
      : 0
  const costoCIFLote = formData.tiempoManoObraLote * tasaCIF
  const costoCIFUnidad = costoCIFLote / (formData.rendimientoLote || 1)

  const costoTotalProduccion = costoMateriaPrimaUnidad + costoManoObraUnidad + costoCIFUnidad

  // Cálculos de empaque - NUEVA FÓRMULA CORREGIDA
  const costoTotalPorEmpaque = costoTotalProduccion * unidadesPorPaquete
  // ✅ FÓRMULA CORREGIDA: Margen sobre costo
  const precioVentaSugeridoPorEmpaque = costoTotalPorEmpaque * (1 + margenGanancia[0] / 100)
  const precioVentaFinalPorEmpaque = precioVentaFinal || precioVentaSugeridoPorEmpaque
  const precioVentaFinalPorUnidad = precioVentaFinalPorEmpaque / unidadesPorPaquete

  // Función auxiliar para obtener unidad mínima
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

  // Función de detección de cambios mejorada
  const hayDatosIngresados = () => {
    if (!productoBase && !productoBaseRepetir) {
      // CREAR NUEVO: Detectar cualquier campo con contenido
      const hayNombre = formData.nombre.trim() !== ""
      const hayRendimiento = formData.rendimientoLote !== 1
      const hayTiempo = formData.tiempoManoObraLote !== 0
      const hayReceta = receta.length > 0
      const hayEmpaque = unidadesPorPaquete !== 1 || precioVentaFinal !== 0

      return hayNombre || hayRendimiento || hayTiempo || hayReceta || hayEmpaque
    }

    if (productoBase) {
      // EDITAR: Comparar vs datos originales del ProductoBase
      const nombreCambiado = formData.nombre.trim() !== productoBase.nombre
      const rendimientoCambiado = formData.rendimientoLote !== productoBase.rendimientoLote
      const tiempoCambiado = formData.tiempoManoObraLote !== productoBase.tiempoManoObraLote
      const recetaCambiada = JSON.stringify(receta) !== JSON.stringify(productoBase.receta)

      return nombreCambiado || rendimientoCambiado || tiempoCambiado || recetaCambiada
    }

    if (productoBaseRepetir) {
      // REPETIR LOTE: Comparar vs datos del último lote completo
      const rendimientoCambiado = formData.rendimientoLote !== ultimoLote?.rendimientoUsado
      const tiempoCambiado = formData.tiempoManoObraLote !== ultimoLote?.tiempoManoObraUsado
      const recetaCambiada = JSON.stringify(receta) !== JSON.stringify(ultimoLote?.recetaUsada || [])

      const margenCambiado = Math.abs(margenGanancia[0] - (ultimoLote?.margenGanancia || 30)) > 0.1
      const empaqueCambiado = unidadesPorPaquete !== (ultimoLote?.unidadesPorPaquete || 1)
      const precioCambiado = Math.abs(precioVentaFinal - (ultimoLote?.precioVentaPorPaquete || 0)) > 0.01

      return (
        rendimientoCambiado || tiempoCambiado || recetaCambiada || margenCambiado || empaqueCambiado || precioCambiado
      )
    }

    return false
  }

  // Reportar cambios al componente padre
  useEffect(() => {
    if (onPendingChanges) {
      onPendingChanges(hayDatosIngresados())
    }
  }, [formData, receta, margenGanancia, unidadesPorPaquete, precioVentaFinal, onPendingChanges])

  useEffect(() => {
    return () => {
      if (onPendingChanges) {
        onPendingChanges(false)
      }
    }
  }, [onPendingChanges])

  // Hook para protección de navegación
  const { confirmNavigation } = useUnsavedChanges(
    hayDatosIngresados(),
    "Se perderán los cambios realizados en el producto. ¿Estás seguro de que quieres salir?",
  )

  const agregarIngrediente = () => {
    if (!ingredienteSeleccionado || cantidadIngrediente <= 0) {
      toast.error("Selecciona una materia prima y cantidad válida")
      return
    }

    const insumo = insumos.find((i) => i.id === ingredienteSeleccionado)
    if (!insumo) return

    const costo = cantidadIngrediente * insumo.costoUnitarioNormalizado
    const nuevoIngrediente: IngredienteReceta = {
      insumoId: ingredienteSeleccionado,
      cantidad: cantidadIngrediente,
      costo,
    }

    setReceta((prev) => [...prev, nuevoIngrediente])
    setIngredienteSeleccionado("")
    setCantidadIngrediente(0)
  }

  const eliminarIngrediente = (index: number) => {
    setReceta((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVolver = async () => {
    const canLeave = await confirmNavigation()
    if (canLeave) {
      onVolver()
    }
  }

  const handleGuardar = async () => {
    // Validación de nombre único - SOLO si no estamos repitiendo un producto
    if (!productoBaseRepetir) {
      const nombreTrimmed = formData.nombre.trim()
      const nombreExiste = productosBase.some(
        (pb) => pb.nombre.toLowerCase().trim() === nombreTrimmed.toLowerCase() && pb.id !== productoBase?.id,
      )

      if (nombreExiste) {
        toast.error("Ya existe un producto con este nombre. Por favor elige un nombre diferente.")
        return
      }
    }

    if (!formData.nombre.trim() || formData.rendimientoLote <= 0) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    const datos = {
      ...formData,
      nombre: formData.nombre.trim(),
      receta,
      costoTotalProduccion,
      margenGanancia: margenGanancia[0],
      precioVentaFinal: precioVentaFinalPorUnidad,
      unidadesPorPaquete,
      precioVentaPorPaquete: precioVentaFinalPorEmpaque,
    }

    console.log("📤 Enviando datos para guardar:", datos)
    onGuardar(datos)
  }

  const handleSubmitInsumo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formDataInsumo.nombre ||
      formDataInsumo.costoCompra <= 0 ||
      formDataInsumo.cantidadPaquetes <= 0 ||
      formDataInsumo.cantidadCompra <= 0
    ) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    agregarInsumo(formDataInsumo)
    setFormDataInsumo({
      nombre: "",
      proveedor: "",
      costoCompra: 0,
      cantidadPaquetes: 1,
      cantidadCompra: 0,
      unidadCompra: "kg",
    })
    setIsInsumoModalOpen(false)
    toast.success("Materia prima agregada exitosamente")
  }

  const cantidadTotalInsumo = formDataInsumo.cantidadPaquetes * formDataInsumo.cantidadCompra

  const getTituloFormulario = () => {
    if (productoBase) return "Editar Producto"
    if (productoBaseRepetir) return "Crear Nuevo Lote"
    return "Crear Producto"
  }

  const getSubtituloFormulario = () => {
    if (productoBase) return `Modifica la receta base de "${productoBase.nombre}"`
    if (productoBaseRepetir) {
      const proximoLote = String(productoBaseRepetir.ultimoLote + 1).padStart(2, "0")
      return `Creando lote ${proximoLote} de "${productoBaseRepetir.nombre}"`
    }
    return "Define tu nueva receta y estrategia de precio"
  }

  const getValorLote = () => {
    if (productoBase) {
      // Para editar, mostrar el lote del último lote creado
      const ultimoLoteCreado = obtenerUltimoLote(productoBase.id)
      return ultimoLoteCreado ? ultimoLoteCreado.numeroLote : "01"
    }
    if (productoBaseRepetir) {
      // Para repetir, mostrar el próximo lote
      return String(productoBaseRepetir.ultimoLote + 1).padStart(2, "0")
    }
    // Para crear nuevo, siempre es 01
    return "01"
  }

  const getTextoBoton = () => {
    if (productoBase) return "Actualizar Producto"
    if (productoBaseRepetir) return "Crear Nuevo Lote"
    return "Guardar Producto"
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header con título y botón */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleVolver} className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Volver al catálogo</p>
              </TooltipContent>
            </Tooltip>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getTituloFormulario()}</h1>
              {getSubtituloFormulario() && <p className="text-gray-600">{getSubtituloFormulario()}</p>}
            </div>
          </div>

          <Button onClick={handleGuardar} size="lg">
            {getTextoBoton()}
          </Button>
        </div>

        {/* Layout principal */}
        <div className="space-y-6">
          {/* Fila superior: Información del Producto + Estrategia de Precio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Producto */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Información del Producto
                </CardTitle>
                <CardDescription>Define las características básicas de tu producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Producto</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Muffin de chocolate sin TACC"
                    disabled={!!productoBaseRepetir}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lote">Lote</Label>
                  <Input id="lote" value={getValorLote()} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rendimiento">Rendimiento del Lote (unidades)</Label>
                  <IntegerInput
                    id="rendimiento"
                    value={formData.rendimientoLote}
                    onChange={(value) => setFormData((prev) => ({ ...prev, rendimientoLote: value }))}
                    placeholder="12"
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidadesPorPaquete">Cantidad de unidades por empaque</Label>
                  <IntegerInput
                    id="unidadesPorPaquete"
                    value={unidadesPorPaquete}
                    onChange={setUnidadesPorPaquete}
                    placeholder="1"
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiempoManoObra">Tiempo de Producción por Lote</Label>
                  <TimeInput
                    id="tiempoManoObra"
                    value={formData.tiempoManoObraLote}
                    onChange={(value) => setFormData((prev) => ({ ...prev, tiempoManoObraLote: value }))}
                    placeholder="2.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Estrategia de Precio */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Estrategia de Precio
                </CardTitle>
                <CardDescription>Define tu margen de ganancia sobre el costo de producción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Margen de ganancia deseado: {margenGanancia[0]}%</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          <strong>Margen sobre costo:</strong> {margenGanancia[0]}% significa que el precio será{" "}
                          {margenGanancia[0]}% más alto que el costo de producción.
                        </p>
                        <p className="mt-1 text-xs">
                          Ejemplo: Costo $100 + {margenGanancia[0]}% = $
                          {(100 * (1 + margenGanancia[0] / 100)).toFixed(2)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Slider
                    value={margenGanancia}
                    onValueChange={setMargenGanancia}
                    max={350}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>350%</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Precio Sugerido por Empaque</div>
                  <p className="text-2xl font-bold text-green-900">${precioVentaSugeridoPorEmpaque.toFixed(2)}</p>
                  <p className="text-xs text-green-600">
                    ({unidadesPorPaquete} unidad{unidadesPorPaquete !== 1 ? "es" : ""} × $
                    {(precioVentaSugeridoPorEmpaque / unidadesPorPaquete).toFixed(2)})
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioVenta">Precio de Venta por Empaque</Label>
                  <CurrencyInput
                    id="precioVenta"
                    value={precioVentaFinal}
                    onChange={setPrecioVentaFinal}
                    placeholder={precioVentaSugeridoPorEmpaque.toFixed(2)}
                  />
                </div>

                {/* Mostrar margen dinámico cuando se ingresa precio manual */}
                {precioVentaFinal > 0 && costoTotalPorEmpaque > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Margen con este precio:</div>
                    <p className="text-lg font-bold text-gray-900">
                      {(((precioVentaFinalPorEmpaque - costoTotalPorEmpaque) / costoTotalPorEmpaque) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600">
                      Ganancia: ${(precioVentaFinalPorEmpaque - costoTotalPorEmpaque).toFixed(2)} por empaque
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCostosModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
                  >
                    <Calculator className="h-4 w-4" />
                    Ver detalle de análisis de costos
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Materias Primas Utilizadas - Ancho completo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="mr-2 h-5 w-5" />
                Materias Primas Utilizadas
              </CardTitle>
              <CardDescription>
                Agrega todas las materias primas necesarias: ingredientes, materiales de empaque y otros insumos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Select value={ingredienteSeleccionado} onValueChange={setIngredienteSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar materia prima" />
                    </SelectTrigger>
                    <SelectContent>
                      {insumos.map((insumo) => (
                        <SelectItem key={insumo.id} value={insumo.id}>
                          {insumo.nombre} ({getUnidadMinima(insumo.unidadCompra)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <QuantityInput
                    placeholder="Cantidad"
                    value={cantidadIngrediente}
                    onChange={setCantidadIngrediente}
                    allowDecimals={true}
                    showUnit={false}
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={agregarIngrediente} className="w-10 h-10 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Agregar materia prima</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsInsumoModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Nueva Materia Prima
              </Button>

              {receta.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="align-middle">Materia Prima</TableHead>
                      <TableHead className="align-middle">Cantidad</TableHead>
                      <TableHead className="align-middle">Costo</TableHead>
                      <TableHead className="align-middle"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receta.map((ingrediente, index) => {
                      const insumo = insumos.find((i) => i.id === ingrediente.insumoId)
                      return (
                        <TableRow key={index}>
                          <TableCell className="align-top">{insumo?.nombre}</TableCell>
                          <TableCell className="align-top">
                            {ingrediente.cantidad} {insumo ? getUnidadMinima(insumo.unidadCompra) : ""}
                          </TableCell>
                          <TableCell className="align-top">${ingrediente.costo.toFixed(2)}</TableCell>
                          <TableCell className="align-top">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => eliminarIngrediente(index)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Eliminar materia prima</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal para Agregar Materia Prima */}
        <BaseModal
          isOpen={isInsumoModalOpen}
          onClose={() => setIsInsumoModalOpen(false)}
          title="Agregar Nueva Materia Prima"
          subtitle="Completa la información de la materia prima para agregarla a tu inventario"
          primaryAction={{
            label: "Guardar Materia Prima",
            onClick: handleSubmitInsumo,
          }}
          secondaryAction={{
            label: "Cancelar",
            onClick: () => setIsInsumoModalOpen(false),
          }}
          size="lg"
        >
          <form onSubmit={handleSubmitInsumo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombreInsumo">Nombre de la Materia Prima *</Label>
              <Input
                id="nombreInsumo"
                value={formDataInsumo.nombre}
                onChange={(e) => setFormDataInsumo((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Fécula de mandioca"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedorInsumo">Proveedor</Label>
              <Input
                id="proveedorInsumo"
                value={formDataInsumo.proveedor}
                onChange={(e) => setFormDataInsumo((prev) => ({ ...prev, proveedor: e.target.value }))}
                placeholder="Ej: Distribuidora Maldonado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costoCompraInsumo">Costo Total de la Compra *</Label>
              <CurrencyInput
                id="costoCompraInsumo"
                value={formDataInsumo.costoCompra}
                onChange={(value) => setFormDataInsumo((prev) => ({ ...prev, costoCompra: value }))}
                placeholder="2125"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidadesCompradas">Unidades Compradas *</Label>
                <IntegerInput
                  id="unidadesCompradas"
                  value={formDataInsumo.cantidadPaquetes}
                  onChange={(value) => setFormDataInsumo((prev) => ({ ...prev, cantidadPaquetes: value }))}
                  placeholder="1"
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pesoVolumenUnidades">Peso/Volumen/Unidades *</Label>
                <QuantityInput
                  id="pesoVolumenUnidades"
                  value={formDataInsumo.cantidadCompra}
                  onChange={(value) => setFormDataInsumo((prev) => ({ ...prev, cantidadCompra: value }))}
                  placeholder="25"
                  unit={formDataInsumo.unidadCompra}
                  showUnit={false}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadCompraInsumo">Unidad de Medida *</Label>
              <Select
                value={formDataInsumo.unidadCompra}
                onValueChange={(value: any) => setFormDataInsumo((prev) => ({ ...prev, unidadCompra: value }))}
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

            {cantidadTotalInsumo > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Cantidad Total Comprada:</p>
                <p className="text-lg font-bold text-blue-900">
                  {cantidadTotalInsumo} {formDataInsumo.unidadCompra}
                </p>
                <p className="text-xs text-blue-600">
                  ({formDataInsumo.cantidadPaquetes} unidad{formDataInsumo.cantidadPaquetes !== 1 ? "es" : ""} ×{" "}
                  {formDataInsumo.cantidadCompra} {formDataInsumo.unidadCompra})
                </p>
              </div>
            )}
          </form>
        </BaseModal>

        {/* Modal de Análisis de Costos */}
        <BaseModal
          isOpen={isCostosModalOpen}
          onClose={() => setIsCostosModalOpen(false)}
          title="Análisis Detallado de Costos"
          subtitle="Desglose completo de todos los costos de producción"
          secondaryAction={{
            label: "Cerrar",
            onClick: () => setIsCostosModalOpen(false),
          }}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Materia Prima por Lote</div>
                <p className="text-lg font-semibold">${costoMateriaPrimaLote.toFixed(2)}</p>
              </div>
              <div>
                <div className="text-sm text-gray-600">Materia Prima por Unidad</div>
                <p className="text-lg font-semibold">${costoMateriaPrimaUnidad.toFixed(2)}</p>
              </div>
              <div>
                <div className="text-sm text-gray-600">Mano de Obra por Lote</div>
                <p className="text-lg font-semibold">${costoManoObraLote.toFixed(2)}</p>
              </div>
              <div>
                <div className="text-sm text-gray-600">Mano de Obra por Unidad</div>
                <p className="text-lg font-semibold">${costoManoObraUnidad.toFixed(2)}</p>
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">CIF</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Costos Indirectos de Fabricación</p>
                    </TooltipContent>
                  </Tooltip>{" "}
                  por Lote
                </div>
                <p className="text-lg font-semibold">${costoCIFLote.toFixed(2)}</p>
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">CIF</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Costos Indirectos de Fabricación</p>
                    </TooltipContent>
                  </Tooltip>{" "}
                  por Unidad
                </div>
                <p className="text-lg font-semibold">${costoCIFUnidad.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Costo Total de Producción (CTP)</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Costo Total de Producción</p>
                  </TooltipContent>
                </Tooltip>{" "}
                por Unidad
              </div>
              <p className="text-2xl font-bold text-blue-900">${costoTotalProduccion.toFixed(2)}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Costo Total por Empaque</div>
              <p className="text-2xl font-bold text-purple-900">${costoTotalPorEmpaque.toFixed(2)}</p>
              <p className="text-xs text-purple-600">
                ({unidadesPorPaquete} unidad{unidadesPorPaquete !== 1 ? "es" : ""} × ${costoTotalProduccion.toFixed(2)})
              </p>
            </div>

            {/* NUEVA SECCIÓN: Explicación de la Fórmula */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-2">Fórmula de Precio Sugerido</div>
              <div className="font-mono text-sm text-green-800 bg-white p-2 rounded border">
                Precio = Costo × (1 + Margen%)
              </div>
              <p className="text-xs text-green-600 mt-2">
                <strong>Ejemplo:</strong> Costo ${costoTotalPorEmpaque.toFixed(2)} × (1 + {margenGanancia[0]}%) = $
                {precioVentaSugeridoPorEmpaque.toFixed(2)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                <strong>Margen sobre costo:</strong> El precio será {margenGanancia[0]}% más alto que el costo de
                producción.
              </p>
            </div>
          </div>
        </BaseModal>
      </div>
    </TooltipProvider>
  )
}

interface HistorialLotesProps {
  productoBase: ProductoBase
  onVolver: () => void
  onEliminar: (productoBase: ProductoBase) => void
}

function HistorialLotes({ productoBase, onVolver, onEliminar }: HistorialLotesProps) {
  const { obtenerLotesPorProducto } = useAppContext()
  const lotes = obtenerLotesPorProducto(productoBase.id)

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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onVolver} className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Volver al catálogo</p>
              </TooltipContent>
            </Tooltip>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Historial de Lotes</h1>
              <p className="text-gray-600">Evolución de costos y precios de "{productoBase.nombre}"</p>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onEliminar(productoBase)}
                className="flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Producto
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar producto y todos sus lotes</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Todos los Lotes de {productoBase.nombre}
            </CardTitle>
            <CardDescription>Historial completo de producción con análisis de rentabilidad</CardDescription>
          </CardHeader>
          <CardContent>
            {lotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay lotes registrados</p>
                <p className="text-sm text-gray-400">Este producto aún no tiene lotes de producción</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="align-middle">Lote</TableHead>
                      <TableHead className="align-middle">Identificador</TableHead>
                      <TableHead className="align-middle">Unidades</TableHead>
                      <TableHead className="align-middle">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">CTP</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Costo Total de Producción</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                      <TableHead className="align-middle">Precio de Venta</TableHead>
                      <TableHead className="align-middle">Empaque</TableHead>
                      <TableHead className="align-middle">Margen</TableHead>
                      <TableHead className="align-middle">Creado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotes.map((lote) => {
                      const { relativa, exacta } = formatearFechaRelativa(lote.fechaCreacion)

                      return (
                        <TableRow key={lote.id}>
                          <TableCell className="font-mono font-medium">{lote.numeroLote}</TableCell>
                          <TableCell className="font-mono text-sm">{lote.identificador}</TableCell>
                          <TableCell>{lote.rendimientoUsado} unidades</TableCell>
                          <TableCell>${lote.costoTotalProduccion.toFixed(2)}</TableCell>
                          <TableCell>${lote.precioVentaFinal.toFixed(2)}</TableCell>
                          <TableCell>
                            {lote.unidadesPorPaquete && lote.unidadesPorPaquete > 1 ? (
                              <div className="text-sm">
                                <div>{lote.unidadesPorPaquete} ud/paq</div>
                                <div className="text-gray-500">${lote.precioVentaPorPaquete?.toFixed(2)}/paq</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Individual</span>
                            )}
                          </TableCell>
                          <TableCell>{lote.margenGanancia.toFixed(1)}%</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{relativa}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{exacta}</p>
                              </TooltipContent>
                            </Tooltip>
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

        {lotes.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Evolución</CardTitle>
              <CardDescription>Comparación de rentabilidad entre el primer y último lote</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Primer Lote</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${lotes[lotes.length - 1].costoTotalProduccion.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-600">Costo por unidad</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Último Lote</div>
                  <div className="text-2xl font-bold text-green-900">${lotes[0].costoTotalProduccion.toFixed(2)}</div>
                  <div className="text-xs text-green-600">Costo por unidad</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Variación</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {(
                      ((lotes[0].costoTotalProduccion - lotes[lotes.length - 1].costoTotalProduccion) /
                        lotes[lotes.length - 1].costoTotalProduccion) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-xs text-purple-600">
                    {lotes[0].costoTotalProduccion > lotes[lotes.length - 1].costoTotalProduccion
                      ? "Aumento"
                      : "Reducción"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
