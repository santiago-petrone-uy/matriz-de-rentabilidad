"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import {
  saveInsumos,
  loadInsumos,
  saveProductosBase,
  loadProductosBase,
  saveLotes,
  loadLotes,
  saveConfiguracion,
  loadConfiguracion,
  deleteAllUserData,
} from "../../lib/database"
import { useAuth } from "../components/auth/AuthProvider"

// Tipos
export interface Insumo {
  id: string
  nombre: string
  categoria: string
  unidadMedida: string
  costoUnitario: number
  cantidad: number
  proveedor?: string
  fechaVencimiento?: string
  notas?: string
}

export interface Ingrediente {
  insumoId: string
  cantidad: number
}

export interface ProductoBase {
  id: string
  nombre: string
  descripcion?: string
  categoria: string
  ingredientes: Ingrediente[]
  rendimiento: number
  unidadRendimiento: string
  tiempoPreparacion?: number
  instrucciones?: string
  precioVenta: number
  notas?: string
}

export interface Lote {
  id: string
  productoId: string
  cantidad: number
  fechaProduccion: string
  costoTotal: number
  precioVentaUnitario: number
  notas?: string
}

export interface Configuracion {
  user_id: string
  margenGananciaDefecto: number
  costoManoObra: number
  costosIndirectos: number
  iva: number
  moneda: string
  unidadesMedida: string[]
  categorias: {
    insumos: string[]
    productos: string[]
  }
}

// Estado inicial
const initialState = {
  insumos: [] as Insumo[],
  productosBase: [] as ProductoBase[],
  lotes: [] as Lote[],
  configuracion: null as Configuracion | null,
  isLoading: false,
  error: null as string | null,
}

type State = typeof initialState

// Acciones
type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_INSUMOS"; payload: Insumo[] }
  | { type: "ADD_INSUMO"; payload: Insumo }
  | { type: "UPDATE_INSUMO"; payload: Insumo }
  | { type: "DELETE_INSUMO"; payload: string }
  | { type: "SET_PRODUCTOS_BASE"; payload: ProductoBase[] }
  | { type: "ADD_PRODUCTO_BASE"; payload: ProductoBase }
  | { type: "UPDATE_PRODUCTO_BASE"; payload: ProductoBase }
  | { type: "DELETE_PRODUCTO_BASE"; payload: string }
  | { type: "SET_LOTES"; payload: Lote[] }
  | { type: "ADD_LOTE"; payload: Lote }
  | { type: "UPDATE_LOTE"; payload: Lote }
  | { type: "DELETE_LOTE"; payload: string }
  | { type: "SET_CONFIGURACION"; payload: Configuracion }
  | { type: "CLEAR_ALL_DATA" }

// Reducer
function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_INSUMOS":
      return { ...state, insumos: action.payload }
    case "ADD_INSUMO":
      return { ...state, insumos: [...state.insumos, action.payload] }
    case "UPDATE_INSUMO":
      return {
        ...state,
        insumos: state.insumos.map((insumo) => (insumo.id === action.payload.id ? action.payload : insumo)),
      }
    case "DELETE_INSUMO":
      return {
        ...state,
        insumos: state.insumos.filter((insumo) => insumo.id !== action.payload),
      }
    case "SET_PRODUCTOS_BASE":
      return { ...state, productosBase: action.payload }
    case "ADD_PRODUCTO_BASE":
      return { ...state, productosBase: [...state.productosBase, action.payload] }
    case "UPDATE_PRODUCTO_BASE":
      return {
        ...state,
        productosBase: state.productosBase.map((producto) =>
          producto.id === action.payload.id ? action.payload : producto,
        ),
      }
    case "DELETE_PRODUCTO_BASE":
      return {
        ...state,
        productosBase: state.productosBase.filter((producto) => producto.id !== action.payload),
      }
    case "SET_LOTES":
      return { ...state, lotes: action.payload }
    case "ADD_LOTE":
      return { ...state, lotes: [...state.lotes, action.payload] }
    case "UPDATE_LOTE":
      return {
        ...state,
        lotes: state.lotes.map((lote) => (lote.id === action.payload.id ? action.payload : lote)),
      }
    case "DELETE_LOTE":
      return {
        ...state,
        lotes: state.lotes.filter((lote) => lote.id !== action.payload),
      }
    case "SET_CONFIGURACION":
      return { ...state, configuracion: action.payload }
    case "CLEAR_ALL_DATA":
      return {
        ...state,
        insumos: [],
        productosBase: [],
        lotes: [],
        configuracion: null,
      }
    default:
      return state
  }
}

// Context
const AppContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
  // Funciones de insumos
  agregarInsumo: (insumo: Omit<Insumo, "id">) => Promise<void>
  actualizarInsumo: (insumo: Insumo) => Promise<void>
  eliminarInsumo: (id: string) => Promise<void>
  // Funciones de productos
  agregarProductoBase: (producto: Omit<ProductoBase, "id">) => Promise<void>
  actualizarProductoBase: (producto: ProductoBase) => Promise<void>
  eliminarProductoBase: (id: string) => Promise<void>
  // Funciones de lotes
  agregarLote: (lote: Omit<Lote, "id">) => Promise<void>
  actualizarLote: (lote: Lote) => Promise<void>
  eliminarLote: (id: string) => Promise<void>
  // Funciones de configuración
  actualizarConfiguracion: (config: Omit<Configuracion, "user_id">) => Promise<void>
  // Función de limpieza
  eliminarTodosLosDatos: () => Promise<void>
  // Getters de estado
  insumos: Insumo[]
  productosBase: ProductoBase[]
  lotes: Lote[]
  configuracion: Configuracion | null
  isLoading: boolean
  error: string | null
} | null>(null)

// Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { user } = useAuth()

  // Cargar datos al inicializar
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const [insumos, productos, lotes, config] = await Promise.all([
        loadInsumos(user.id),
        loadProductosBase(user.id),
        loadLotes(user.id),
        loadConfiguracion(user.id),
      ])

      dispatch({ type: "SET_INSUMOS", payload: insumos })
      dispatch({ type: "SET_PRODUCTOS_BASE", payload: productos })
      dispatch({ type: "SET_LOTES", payload: lotes })
      if (config) {
        dispatch({ type: "SET_CONFIGURACION", payload: config })
      }
    } catch (error) {
      console.error("Error loading data:", error)
      dispatch({ type: "SET_ERROR", payload: "Error al cargar los datos" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Funciones de insumos
  const agregarInsumo = async (insumoData: Omit<Insumo, "id">) => {
    if (!user) return

    const nuevoInsumo: Insumo = {
      ...insumoData,
      id: crypto.randomUUID(),
    }

    try {
      await saveInsumos(user.id, [...state.insumos, nuevoInsumo])
      dispatch({ type: "ADD_INSUMO", payload: nuevoInsumo })
    } catch (error) {
      console.error("Error adding insumo:", error)
      throw error
    }
  }

  const actualizarInsumo = async (insumo: Insumo) => {
    if (!user) return

    try {
      const insumosActualizados = state.insumos.map((i) => (i.id === insumo.id ? insumo : i))
      await saveInsumos(user.id, insumosActualizados)
      dispatch({ type: "UPDATE_INSUMO", payload: insumo })
    } catch (error) {
      console.error("Error updating insumo:", error)
      throw error
    }
  }

  const eliminarInsumo = async (id: string) => {
    if (!user) return

    try {
      const insumosActualizados = state.insumos.filter((i) => i.id !== id)
      await saveInsumos(user.id, insumosActualizados)
      dispatch({ type: "DELETE_INSUMO", payload: id })
    } catch (error) {
      console.error("Error deleting insumo:", error)
      throw error
    }
  }

  // Funciones de productos
  const agregarProductoBase = async (productoData: Omit<ProductoBase, "id">) => {
    if (!user) return

    const nuevoProducto: ProductoBase = {
      ...productoData,
      id: crypto.randomUUID(),
    }

    try {
      await saveProductosBase(user.id, [...state.productosBase, nuevoProducto])
      dispatch({ type: "ADD_PRODUCTO_BASE", payload: nuevoProducto })
    } catch (error) {
      console.error("Error adding producto:", error)
      throw error
    }
  }

  const actualizarProductoBase = async (producto: ProductoBase) => {
    if (!user) return

    try {
      const productosActualizados = state.productosBase.map((p) => (p.id === producto.id ? producto : p))
      await saveProductosBase(user.id, productosActualizados)
      dispatch({ type: "UPDATE_PRODUCTO_BASE", payload: producto })
    } catch (error) {
      console.error("Error updating producto:", error)
      throw error
    }
  }

  const eliminarProductoBase = async (id: string) => {
    if (!user) return

    try {
      const productosActualizados = state.productosBase.filter((p) => p.id !== id)
      await saveProductosBase(user.id, productosActualizados)
      dispatch({ type: "DELETE_PRODUCTO_BASE", payload: id })
    } catch (error) {
      console.error("Error deleting producto:", error)
      throw error
    }
  }

  // Funciones de lotes
  const agregarLote = async (loteData: Omit<Lote, "id">) => {
    if (!user) return

    const nuevoLote: Lote = {
      ...loteData,
      id: crypto.randomUUID(),
    }

    try {
      await saveLotes(user.id, [...state.lotes, nuevoLote])
      dispatch({ type: "ADD_LOTE", payload: nuevoLote })
    } catch (error) {
      console.error("Error adding lote:", error)
      throw error
    }
  }

  const actualizarLote = async (lote: Lote) => {
    if (!user) return

    try {
      const lotesActualizados = state.lotes.map((l) => (l.id === lote.id ? lote : l))
      await saveLotes(user.id, lotesActualizados)
      dispatch({ type: "UPDATE_LOTE", payload: lote })
    } catch (error) {
      console.error("Error updating lote:", error)
      throw error
    }
  }

  const eliminarLote = async (id: string) => {
    if (!user) return

    try {
      const lotesActualizados = state.lotes.filter((l) => l.id !== id)
      await saveLotes(user.id, lotesActualizados)
      dispatch({ type: "DELETE_LOTE", payload: id })
    } catch (error) {
      console.error("Error deleting lote:", error)
      throw error
    }
  }

  // Función de configuración
  const actualizarConfiguracion = async (configData: Omit<Configuracion, "user_id">) => {
    if (!user) return

    const config: Configuracion = {
      ...configData,
      user_id: user.id,
    }

    try {
      await saveConfiguracion(config)
      dispatch({ type: "SET_CONFIGURACION", payload: config })
    } catch (error) {
      console.error("Error updating configuracion:", error)
      throw error
    }
  }

  // Función de limpieza total
  const eliminarTodosLosDatos = async () => {
    if (!user) return

    try {
      await deleteAllUserData(user.id)
      dispatch({ type: "CLEAR_ALL_DATA" })
    } catch (error) {
      console.error("Error clearing all data:", error)
      throw error
    }
  }

  const value = {
    state,
    dispatch,
    // Funciones
    agregarInsumo,
    actualizarInsumo,
    eliminarInsumo,
    agregarProductoBase,
    actualizarProductoBase,
    eliminarProductoBase,
    agregarLote,
    actualizarLote,
    eliminarLote,
    actualizarConfiguracion,
    eliminarTodosLosDatos,
    // Getters
    insumos: state.insumos,
    productosBase: state.productosBase,
    lotes: state.lotes,
    configuracion: state.configuracion,
    isLoading: state.isLoading,
    error: state.error,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
