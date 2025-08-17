"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  getConfiguracion,
  saveConfiguracion,
  getInsumos,
  saveInsumo,
  createInsumo,
  deleteInsumo,
  updateCantidadUtilizada,
  getProductosBase,
  saveProductoBase,
  createProductoBase,
  deleteProductoBase,
  updateUltimoLote,
  getLotes,
  saveLote,
  createLote,
  deleteLote,
  deleteAllUserData,
} from "@/lib/database"
import { toast } from "sonner"

// NUEVO: Producto Base (la "receta/plantilla")
export interface ProductoBase {
  id: string
  nombre: string
  receta: IngredienteReceta[]
  tiempoManoObraLote: number
  rendimientoLote: number
  fechaCreacion: string
  ultimoLote: number // Para tracking del próximo lote
}

// NUEVO: Lote específico de un producto
export interface LoteProducto {
  id: string
  productoBaseId: string // Referencia al producto base
  numeroLote: string // "01", "02", "03", etc.
  identificador: string // Como el actual
  costoTotalProduccion: number
  margenGanancia: number
  precioVentaFinal: number
  fechaCreacion: string
  // Datos específicos del lote (pueden diferir del ProductoBase)
  recetaUsada: IngredienteReceta[]
  tiempoManoObraUsado: number
  rendimientoUsado: number
  // NUEVO: Campos de empaque
  unidadesPorPaquete?: number
  precioVentaPorPaquete?: number
}

// Mantener IngredienteReceta igual
export interface IngredienteReceta {
  insumoId: string
  cantidad: number
  costo: number
}

export interface Configuracion {
  valorHoraProduccion: number
  costosIndirectosMensuales: number
  horasProduccionMensuales: number
}

export interface Insumo {
  id: string
  nombre: string
  proveedor?: string
  costoCompra: number
  cantidadPaquetes: number
  cantidadCompra: number
  unidadCompra: "kg" | "g" | "l" | "ml" | "unidades"
  costoUnitarioNormalizado: number
  cantidadUtilizada: number // cantidad consumida en recetas
  fechaAgregado: string // fecha de creación
}

interface LoadingStates {
  configuracion: boolean
  insumos: boolean
  productosBase: boolean
  lotes: boolean
  dashboard: boolean
}

interface AppContextType {
  configuracion: Configuracion
  setConfiguracion: (config: Configuracion) => void
  insumos: Insumo[]
  setInsumos: (insumos: Insumo[]) => void
  productosBase: ProductoBase[]
  setProductosBase: (productosBase: ProductoBase[]) => void
  lotes: LoteProducto[]
  setLotes: (lotes: LoteProducto[]) => void
  agregarInsumo: (
    insumo: Omit<Insumo, "id" | "costoUnitarioNormalizado" | "fechaAgregado"> & { cantidadUtilizada?: number },
  ) => void
  editarInsumo: (
    id: string,
    insumo: Omit<Insumo, "id" | "costoUnitarioNormalizado" | "cantidadUtilizada" | "fechaAgregado">,
  ) => void
  eliminarInsumo: (id: string) => void
  crearProducto: (datos: {
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
  repetirProducto: (
    productoBaseId: string,
    datosLote: {
      recetaUsada: IngredienteReceta[]
      tiempoManoObraUsado: number
      rendimientoUsado: number
      margenGanancia: number
      precioVentaFinal: number
      costoTotalProduccion: number
      unidadesPorPaquete: number
      precioVentaPorPaquete: number
    },
  ) => void
  editarProductoBase: (
    id: string,
    datos: {
      nombre: string
      receta: IngredienteReceta[]
      tiempoManoObraLote: number
      rendimientoLote: number
    },
  ) => void
  eliminarProductoBase: (id: string) => void
  obtenerLotesPorProducto: (productoBaseId: string) => LoteProducto[]
  obtenerUltimoLote: (productoBaseId: string) => LoteProducto | null
  actualizarCantidadUtilizada: (insumoId: string, cantidad: number) => void
  eliminarTodosLosDatos: () => Promise<void>
  loadingStates: LoadingStates
  // Estados de carga y error
  loading: boolean
  error: string | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [configuracion, setConfiguracionState] = useState<Configuracion>({
    valorHoraProduccion: 0,
    costosIndirectosMensuales: 0,
    horasProduccionMensuales: 0,
  })

  const [insumos, setInsumosState] = useState<Insumo[]>([])
  const [productosBase, setProductosBaseState] = useState<ProductoBase[]>([])
  const [lotes, setLotesState] = useState<LoteProducto[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Estados de carga y error
  const [loading, setLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    configuracion: true,
    insumos: true,
    productosBase: true,
    lotes: true,
    dashboard: true,
  })
  const [error, setError] = useState<string | null>(null)

  // Función para generar UUID v4
  const generateUUID = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // Función para generar identificador automático
  const generarIdentificador = (nombre: string, fecha: string): string => {
    const fechaObj = new Date(fecha)
    const año = fechaObj.getFullYear().toString().slice(-2)
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0")
    const dia = String(fechaObj.getDate()).padStart(2, "0")

    // Obtener iniciales del nombre (máximo 3 caracteres)
    const iniciales = nombre
      .split(" ")
      .map((palabra) => palabra.charAt(0).toUpperCase())
      .join("")
      .slice(0, 3)

    return `${año}${mes}${dia}-${iniciales}`
  }

  // Cargar datos desde Supabase al inicializar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadData = async () => {
        try {
          console.log("🚀 Iniciando Matriz de Rentabilidad con Supabase...")
          setLoading(true)
          setError(null)

          // Cargar configuración
          console.log("📊 Cargando configuración de costos...")
          const configSupabase = await getConfiguracion()
          setConfiguracionState(configSupabase)
          console.log("✅ Configuración cargada:", {
            valorHora: configSupabase.valorHoraProduccion,
            costosIndirectos: configSupabase.costosIndirectosMensuales,
            horasProduccion: configSupabase.horasProduccionMensuales,
          })
          setLoadingStates((prev) => ({ ...prev, configuracion: false }))

          // Cargar insumos
          console.log("📦 Cargando inventario de materias primas...")
          const insumosSupabase = await getInsumos()
          setInsumosState(insumosSupabase)
          console.log(`✅ ${insumosSupabase.length} materias primas cargadas`)
          setLoadingStates((prev) => ({ ...prev, insumos: false }))

          // Cargar productos base
          console.log("🍰 Cargando catálogo de productos...")
          const productosBaseSupabase = await getProductosBase()
          setProductosBaseState(productosBaseSupabase)
          console.log(`✅ ${productosBaseSupabase.length} productos base cargados`)
          setLoadingStates((prev) => ({ ...prev, productosBase: false }))

          // Cargar lotes
          console.log("📦 Cargando historial de lotes...")
          const lotesSupabase = await getLotes()
          setLotesState(lotesSupabase)
          console.log(`✅ ${lotesSupabase.length} lotes cargados`)
          setLoadingStates((prev) => ({ ...prev, lotes: false, dashboard: false }))

          console.log("🎉 ¡Aplicación lista! Todos los datos cargados desde Supabase")
        } catch (error) {
          console.error("❌ Error cargando datos desde Supabase:", error)
          setError(
            error instanceof Error
              ? `Error de conexión: ${error.message}`
              : "No se pudo conectar con la base de datos. Verifica tu conexión a internet.",
          )
        } finally {
          setLoading(false)
          setIsLoaded(true)
        }
      }

      loadData()
    }
  }, [])

  // Guardar configuración en Supabase
  const setConfiguracion = async (config: Configuracion) => {
    try {
      setLoading(true)
      setError(null)

      console.log("💾 Guardando configuración de costos en Supabase...")
      console.log("📊 Datos:", {
        valorHora: config.valorHoraProduccion,
        costosIndirectos: config.costosIndirectosMensuales,
        horasProduccion: config.horasProduccionMensuales,
      })

      const success = await saveConfiguracion(config)

      if (success) {
        setConfiguracionState(config)
        console.log("✅ Configuración guardada exitosamente")
        toast.success("Configuración guardada en Supabase", {
          description: "Tus costos base han sido actualizados en la nube",
        })
      } else {
        throw new Error("Error guardando configuración en Supabase")
      }
    } catch (error) {
      console.error("❌ Error guardando configuración:", error)
      const errorMessage = "No se pudo guardar la configuración en Supabase. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al guardar configuración", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Guardar insumos en Supabase
  const setInsumos = async (nuevosInsumos: Insumo[]) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`💾 Guardando ${nuevosInsumos.length} materias primas en Supabase...`)

      // Guardar cada insumo en Supabase
      for (const insumo of nuevosInsumos) {
        await saveInsumo(insumo)
      }

      setInsumosState(nuevosInsumos)
      console.log("✅ Inventario de materias primas actualizado")
      toast.success("Inventario actualizado en Supabase", {
        description: `${nuevosInsumos.length} materias primas sincronizadas`,
      })
    } catch (error) {
      console.error("❌ Error guardando insumos:", error)
      const errorMessage = "No se pudo actualizar el inventario en Supabase. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al actualizar inventario", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Guardar productos base en Supabase
  const setProductosBase = async (nuevosProductos: ProductoBase[]) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`💾 Guardando ${nuevosProductos.length} productos base en Supabase...`)

      // Guardar cada producto base en Supabase
      for (const producto of nuevosProductos) {
        await saveProductoBase(producto)
      }

      setProductosBaseState(nuevosProductos)
      console.log("✅ Catálogo de productos actualizado")
      toast.success("Catálogo actualizado en Supabase", {
        description: `${nuevosProductos.length} productos sincronizados`,
      })
    } catch (error) {
      console.error("❌ Error guardando productos base:", error)
      const errorMessage = "No se pudo actualizar el catálogo en Supabase. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al actualizar catálogo", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Guardar lotes en Supabase
  const setLotes = async (nuevosLotes: LoteProducto[]) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`💾 Guardando ${nuevosLotes.length} lotes en Supabase...`)

      // Guardar cada lote en Supabase
      for (const lote of nuevosLotes) {
        await saveLote(lote)
      }

      setLotesState(nuevosLotes)
      console.log("✅ Historial de lotes actualizado")
      toast.success("Historial actualizado en Supabase", {
        description: `${nuevosLotes.length} lotes sincronizados`,
      })
    } catch (error) {
      console.error("❌ Error guardando lotes:", error)
      const errorMessage = "No se pudo actualizar el historial en Supabase. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al actualizar historial", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const calcularCostoUnitarioNormalizado = (
    costoCompra: number,
    cantidadPaquetes: number,
    cantidadCompra: number,
    unidadCompra: string,
  ): number => {
    const cantidadTotal = cantidadPaquetes * cantidadCompra
    let cantidadMinima = cantidadTotal
    if (unidadCompra === "kg") cantidadMinima = cantidadTotal * 1000
    if (unidadCompra === "l") cantidadMinima = cantidadTotal * 1000
    return costoCompra / cantidadMinima
  }

  // Agregar insumo a Supabase
  const agregarInsumo = async (
    insumoData: Omit<Insumo, "id" | "costoUnitarioNormalizado" | "fechaAgregado"> & { cantidadUtilizada?: number },
  ) => {
    try {
      setLoading(true)
      setError(null)

      const costoUnitarioNormalizado = calcularCostoUnitarioNormalizado(
        insumoData.costoCompra,
        insumoData.cantidadPaquetes,
        insumoData.cantidadCompra,
        insumoData.unidadCompra,
      )

      const datosCompletos = {
        ...insumoData,
        costoUnitarioNormalizado,
        cantidadUtilizada: insumoData.cantidadUtilizada || 0,
        fechaAgregado: new Date().toISOString(),
      }

      console.log(`💾 Agregando nueva materia prima: "${datosCompletos.nombre}"`)
      console.log("📊 Detalles:", {
        costo: datosCompletos.costoCompra,
        cantidad: `${datosCompletos.cantidadPaquetes} × ${datosCompletos.cantidadCompra} ${datosCompletos.unidadCompra}`,
        costoUnitario: costoUnitarioNormalizado.toFixed(4),
      })

      const { success, insumo } = await createInsumo(datosCompletos)

      if (success && insumo) {
        const nuevosInsumos = [...insumos, insumo]
        setInsumosState(nuevosInsumos)
        console.log(`✅ Materia prima agregada con ID: ${insumo.id}`)
        toast.success("Nueva materia prima agregada", {
          description: `"${insumo.nombre}" ha sido agregada a tu inventario`,
        })
      } else {
        throw new Error("Error creando materia prima en Supabase")
      }
    } catch (error) {
      console.error("❌ Error agregando materia prima:", error)
      const errorMessage = "No se pudo agregar la materia prima. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al agregar materia prima", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Editar insumo en Supabase
  const editarInsumo = async (
    id: string,
    insumoData: Omit<Insumo, "id" | "costoUnitarioNormalizado" | "cantidadUtilizada" | "fechaAgregado">,
  ) => {
    try {
      setLoading(true)
      setError(null)

      const insumoExistente = insumos.find((i) => i.id === id)
      const costoUnitarioNormalizado = calcularCostoUnitarioNormalizado(
        insumoData.costoCompra,
        insumoData.cantidadPaquetes,
        insumoData.cantidadCompra,
        insumoData.unidadCompra,
      )

      const insumoActualizado: Insumo = {
        ...insumoData,
        id,
        costoUnitarioNormalizado,
        cantidadUtilizada: insumoExistente?.cantidadUtilizada || 0,
        fechaAgregado: insumoExistente?.fechaAgregado || new Date().toISOString(),
      }

      console.log(`💾 Actualizando materia prima: "${insumoActualizado.nombre}"`)
      console.log("📊 Nuevos datos:", {
        costo: insumoActualizado.costoCompra,
        cantidad: `${insumoActualizado.cantidadPaquetes} × ${insumoActualizado.cantidadCompra} ${insumoActualizado.unidadCompra}`,
        costoUnitario: costoUnitarioNormalizado.toFixed(4),
      })

      const success = await saveInsumo(insumoActualizado)

      if (success) {
        const nuevosInsumos = insumos.map((insumo) => (insumo.id === id ? insumoActualizado : insumo))
        setInsumosState(nuevosInsumos)
        console.log("✅ Materia prima actualizada exitosamente")
        toast.success("Materia prima actualizada", {
          description: `Los datos de "${insumoActualizado.nombre}" han sido actualizados`,
        })
      } else {
        throw new Error("Error actualizando materia prima en Supabase")
      }
    } catch (error) {
      console.error("❌ Error editando materia prima:", error)
      const errorMessage = "No se pudo actualizar la materia prima. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al actualizar materia prima", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Eliminar insumo de Supabase
  const eliminarInsumo = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const insumoAEliminar = insumos.find((i) => i.id === id)
      console.log(`🗑️ Eliminando materia prima: "${insumoAEliminar?.nombre || id}"`)

      const success = await deleteInsumo(id)

      if (success) {
        const nuevosInsumos = insumos.filter((insumo) => insumo.id !== id)
        setInsumosState(nuevosInsumos)
        console.log("✅ Materia prima eliminada permanentemente")
        toast.success("Materia prima eliminada", {
          description: `"${insumoAEliminar?.nombre || "La materia prima"}" ha sido eliminada permanentemente`,
        })
      } else {
        throw new Error("Error eliminando materia prima de Supabase")
      }
    } catch (error) {
      console.error("❌ Error eliminando materia prima:", error)
      const errorMessage = "No se pudo eliminar la materia prima. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al eliminar materia prima", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Crear producto en Supabase
  const crearProducto = async (datos: {
    nombre: string
    receta: IngredienteReceta[]
    tiempoManoObraLote: number
    rendimientoLote: number
    margenGanancia: number
    precioVentaFinal: number
    costoTotalProduccion: number
    unidadesPorPaquete: number
    precioVentaPorPaquete: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      const fechaCreacion = new Date().toISOString()

      console.log(`🍰 Creando nuevo producto: "${datos.nombre}"`)
      console.log("📊 Detalles del producto:", {
        rendimiento: `${datos.rendimientoLote} unidades`,
        tiempo: `${datos.tiempoManoObraLote}h`,
        costo: `$${datos.costoTotalProduccion.toFixed(2)}`,
        margen: `${datos.margenGanancia}%`,
        receta: `${datos.receta.length} materias primas`,
      })

      // Crear ProductoBase
      const datosProductoBase = {
        nombre: datos.nombre,
        receta: datos.receta,
        tiempoManoObraLote: datos.tiempoManoObraLote,
        rendimientoLote: datos.rendimientoLote,
        fechaCreacion,
        ultimoLote: 1,
      }

      const { success, producto } = await createProductoBase(datosProductoBase)

      if (success && producto) {
        console.log(`✅ Producto base creado con ID: ${producto.id}`)

        // Crear primer lote
        const datosLote = {
          productoBaseId: producto.id,
          numeroLote: "01",
          identificador: generarIdentificador(datos.nombre, fechaCreacion),
          costoTotalProduccion: datos.costoTotalProduccion,
          margenGanancia: datos.margenGanancia,
          precioVentaFinal: datos.precioVentaFinal,
          fechaCreacion,
          recetaUsada: datos.receta,
          tiempoManoObraUsado: datos.tiempoManoObraLote,
          rendimientoUsado: datos.rendimientoLote,
          unidadesPorPaquete: datos.unidadesPorPaquete,
          precioVentaPorPaquete: datos.precioVentaPorPaquete,
        }

        console.log("📦 Creando primer lote (01)...")
        const { success: loteSuccess, lote } = await createLote(datosLote)

        if (loteSuccess && lote) {
          console.log(`✅ Primer lote creado con ID: ${lote.id}`)

          // Actualizar cantidades utilizadas de insumos
          console.log("🔄 Actualizando inventario de materias primas...")
          datos.receta.forEach((ingrediente) => {
            actualizarCantidadUtilizada(ingrediente.insumoId, ingrediente.cantidad)
          })

          const nuevosProductosBase = [...productosBase, producto]
          const nuevosLotes = [...lotes, lote]

          setProductosBaseState(nuevosProductosBase)
          setLotesState(nuevosLotes)

          console.log("🎉 ¡Producto creado exitosamente!")
          toast.success("Nuevo producto creado", {
            description: `"${datos.nombre}" y su primer lote han sido agregados a tu catálogo`,
          })
        } else {
          throw new Error("Error creando primer lote en Supabase")
        }
      } else {
        throw new Error("Error creando producto base en Supabase")
      }
    } catch (error) {
      console.error("❌ Error creando producto:", error)
      const errorMessage = "No se pudo crear el producto. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al crear producto", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Repetir producto (crear nuevo lote) en Supabase
  const repetirProducto = async (
    productoBaseId: string,
    datosLote: {
      recetaUsada: IngredienteReceta[]
      tiempoManoObraUsado: number
      rendimientoUsado: number
      margenGanancia: number
      precioVentaFinal: number
      costoTotalProduccion: number
      unidadesPorPaquete: number
      precioVentaPorPaquete: number
    },
  ) => {
    try {
      setLoading(true)
      setError(null)

      const productoBase = productosBase.find((p) => p.id === productoBaseId)
      if (!productoBase) return

      const nuevoNumeroLote = productoBase.ultimoLote + 1
      const fechaCreacion = new Date().toISOString()

      console.log(`📦 Creando nuevo lote para "${productoBase.nombre}"`)
      console.log("📊 Detalles del lote:", {
        numero: String(nuevoNumeroLote).padStart(2, "0"),
        rendimiento: `${datosLote.rendimientoUsado} unidades`,
        tiempo: `${datosLote.tiempoManoObraUsado}h`,
        costo: `$${datosLote.costoTotalProduccion.toFixed(2)}`,
        margen: `${datosLote.margenGanancia}%`,
      })

      // Crear nuevo lote
      const datosNuevoLote = {
        productoBaseId,
        numeroLote: String(nuevoNumeroLote).padStart(2, "0"),
        identificador: generarIdentificador(productoBase.nombre, fechaCreacion),
        costoTotalProduccion: datosLote.costoTotalProduccion,
        margenGanancia: datosLote.margenGanancia,
        precioVentaFinal: datosLote.precioVentaFinal,
        fechaCreacion,
        recetaUsada: datosLote.recetaUsada,
        tiempoManoObraUsado: datosLote.tiempoManoObraUsado,
        rendimientoUsado: datosLote.rendimientoUsado,
        unidadesPorPaquete: datosLote.unidadesPorPaquete,
        precioVentaPorPaquete: datosLote.precioVentaPorPaquete,
      }

      const { success: loteSuccess, lote } = await createLote(datosNuevoLote)

      if (loteSuccess && lote) {
        console.log(`✅ Lote ${lote.numeroLote} creado con ID: ${lote.id}`)

        // Actualizar ultimoLote en Supabase
        console.log("🔄 Actualizando contador de lotes...")
        const success = await updateUltimoLote(productoBaseId, nuevoNumeroLote)

        if (success) {
          // Actualizar cantidades utilizadas de insumos
          console.log("🔄 Actualizando inventario de materias primas...")
          datosLote.recetaUsada.forEach((ingrediente) => {
            actualizarCantidadUtilizada(ingrediente.insumoId, ingrediente.cantidad)
          })

          // Actualizar ProductoBase local
          const productosBaseActualizados = productosBase.map((pb) =>
            pb.id === productoBaseId ? { ...pb, ultimoLote: nuevoNumeroLote } : pb,
          )

          setProductosBaseState(productosBaseActualizados)
          setLotesState([...lotes, lote])

          console.log("🎉 ¡Nuevo lote creado exitosamente!")
          toast.success("Nuevo lote creado", {
            description: `Lote ${lote.numeroLote} de "${productoBase.nombre}" agregado al historial`,
          })
        } else {
          throw new Error("Error actualizando contador de lotes en Supabase")
        }
      } else {
        throw new Error("Error creando lote en Supabase")
      }
    } catch (error) {
      console.error("❌ Error repitiendo producto:", error)
      const errorMessage = "No se pudo crear el nuevo lote. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al crear lote", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Editar producto base en Supabase
  const editarProductoBase = async (
    id: string,
    datos: {
      nombre: string
      receta: IngredienteReceta[]
      tiempoManoObraLote: number
      rendimientoLote: number
    },
  ) => {
    try {
      setLoading(true)
      setError(null)

      const productoExistente = productosBase.find((p) => p.id === id)
      if (!productoExistente) return

      const productoActualizado: ProductoBase = {
        ...productoExistente,
        ...datos,
      }

      console.log(`💾 Actualizando producto base: "${datos.nombre}"`)
      console.log("📊 Cambios:", {
        rendimiento: `${datos.rendimientoLote} unidades`,
        tiempo: `${datos.tiempoManoObraLote}h`,
        receta: `${datos.receta.length} materias primas`,
      })

      const success = await saveProductoBase(productoActualizado)

      if (success) {
        const productosBaseActualizados = productosBase.map((pb) => (pb.id === id ? productoActualizado : pb))
        setProductosBaseState(productosBaseActualizados)
        console.log("✅ Producto base actualizado exitosamente")
        toast.success("Producto actualizado", {
          description: `La receta base de "${datos.nombre}" ha sido actualizada`,
        })
      } else {
        throw new Error("Error actualizando producto base en Supabase")
      }
    } catch (error) {
      console.error("❌ Error editando producto base:", error)
      const errorMessage = "No se pudo actualizar el producto. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al actualizar producto", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Eliminar producto base de Supabase
  const eliminarProductoBase = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const productoAEliminar = productosBase.find((p) => p.id === id)
      const lotesAEliminar = lotes.filter((lote) => lote.productoBaseId === id)

      console.log(`🗑️ Eliminando producto: "${productoAEliminar?.nombre || id}"`)
      console.log(`📦 Eliminando ${lotesAEliminar.length} lotes asociados...`)

      const success = await deleteProductoBase(id)

      if (success) {
        // Eliminar ProductoBase
        const nuevosProductosBase = productosBase.filter((pb) => pb.id !== id)

        // Eliminar todos los lotes asociados y revertir cantidades utilizadas
        console.log("🔄 Revirtiendo cantidades utilizadas en inventario...")
        for (const lote of lotesAEliminar) {
          await deleteLote(lote.id)
          // Revertir cantidades utilizadas
          lote.recetaUsada.forEach((ingrediente) => {
            actualizarCantidadUtilizada(ingrediente.insumoId, -ingrediente.cantidad)
          })
        }

        const nuevosLotes = lotes.filter((lote) => lote.productoBaseId !== id)

        setProductosBaseState(nuevosProductosBase)
        setLotesState(nuevosLotes)

        console.log("✅ Producto y lotes eliminados permanentemente")
        toast.success("Producto eliminado", {
          description: `"${productoAEliminar?.nombre || "El producto"}" y todos sus lotes han sido eliminados permanentemente`,
        })
      } else {
        throw new Error("Error eliminando producto base de Supabase")
      }
    } catch (error) {
      console.error("❌ Error eliminando producto base:", error)
      const errorMessage = "No se pudo eliminar el producto. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al eliminar producto", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const obtenerLotesPorProducto = (productoBaseId: string): LoteProducto[] => {
    return lotes
      .filter((lote) => lote.productoBaseId === productoBaseId)
      .sort((a, b) => Number.parseInt(b.numeroLote) - Number.parseInt(a.numeroLote))
  }

  const obtenerUltimoLote = (productoBaseId: string): LoteProducto | null => {
    const lotesDelProducto = obtenerLotesPorProducto(productoBaseId)
    return lotesDelProducto.length > 0 ? lotesDelProducto[0] : null
  }

  // Actualizar cantidad utilizada en Supabase
  const actualizarCantidadUtilizada = async (insumoId: string, cantidad: number) => {
    try {
      const insumoExistente = insumos.find((i) => i.id === insumoId)
      if (!insumoExistente) return

      const nuevaCantidad = Math.max(0, insumoExistente.cantidadUtilizada + cantidad)

      console.log(`🔄 Actualizando inventario: "${insumoExistente.nombre}"`)
      console.log("📊 Cambio:", {
        anterior: insumoExistente.cantidadUtilizada,
        cambio: cantidad > 0 ? `+${cantidad}` : cantidad.toString(),
        nueva: nuevaCantidad,
      })

      const success = await updateCantidadUtilizada(insumoId, nuevaCantidad)

      if (success) {
        setInsumosState((prevInsumos) => {
          return prevInsumos.map((insumo) => {
            if (insumo.id === insumoId) {
              return {
                ...insumo,
                cantidadUtilizada: nuevaCantidad,
              }
            }
            return insumo
          })
        })
        console.log("✅ Inventario actualizado exitosamente")
      } else {
        throw new Error("Error actualizando cantidad utilizada en Supabase")
      }
    } catch (error) {
      console.error("❌ Error actualizando cantidad utilizada:", error)
      setError("No se pudo actualizar el inventario. Verifica tu conexión.")
    }
  }

  // NUEVA FUNCIÓN: Eliminar todos los datos del usuario
  const eliminarTodosLosDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🗑️ Iniciando eliminación masiva de todos los datos...")

      const { success, errors } = await deleteAllUserData()

      if (success) {
        // Limpiar estados locales
        setConfiguracionState({
          valorHoraProduccion: 0,
          costosIndirectosMensuales: 0,
          horasProduccionMensuales: 0,
        })
        setInsumosState([])
        setProductosBaseState([])
        setLotesState([])

        console.log("🎉 ¡Eliminación masiva completada exitosamente!")
        toast.success("Toda tu información fue eliminada completamente", {
          description: "Todos los datos han sido eliminados permanentemente de la base de datos",
        })
      } else {
        console.log("⚠️ Eliminación masiva completada con errores:", errors)
        toast.error("Hubo problemas eliminando algunos datos", {
          description: `Errores: ${errors.join(", ")}`,
        })
      }
    } catch (error) {
      console.error("❌ Error en eliminación masiva:", error)
      const errorMessage = "No se pudo eliminar toda la información. Verifica tu conexión."
      setError(errorMessage)
      toast.error("Error al eliminar información", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de carga mejorada
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900">Matriz de Rentabilidad</div>
          <div className="text-sm text-gray-600">
            {loading ? "Conectando con Supabase..." : "Cargando tu información empresarial..."}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg max-w-md">
              <div className="text-sm text-red-800">
                <strong>Error de conexión:</strong>
                <br />
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        configuracion,
        setConfiguracion,
        insumos,
        setInsumos,
        productosBase,
        setProductosBase,
        lotes,
        setLotes,
        agregarInsumo,
        editarInsumo,
        eliminarInsumo,
        crearProducto,
        repetirProducto,
        editarProductoBase,
        eliminarProductoBase,
        obtenerLotesPorProducto,
        obtenerUltimoLote,
        actualizarCantidadUtilizada,
        eliminarTodosLosDatos,
        loading,
        error,
        loadingStates,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
