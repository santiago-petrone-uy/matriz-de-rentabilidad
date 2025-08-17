import { createClient } from "@supabase/supabase-js"
import type { Insumo, ProductoBase, Lote, Configuracion } from "../app/context/AppContext"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Función para generar UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// =============================================
// CONFIGURACIÓN
// =============================================

export async function getConfiguracion(): Promise<Configuracion | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { data, error } = await supabase.from("configuracion").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error cargando configuración:", error)
    return null
  }
}

export async function saveConfiguracion(config: Configuracion): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { error } = await supabase.from("configuracion").upsert(config, {
      onConflict: "user_id",
    })

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error guardando configuración:", error)
    return false
  }
}

export async function deleteConfiguracion(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("configuracion").delete().eq("user_id", userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error eliminando configuración:", error)
    return false
  }
}

// =============================================
// INSUMOS (MATERIAS PRIMAS)
// =============================================

export async function getInsumos(): Promise<Insumo[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { data, error } = await supabase.from("insumos").select("data").eq("user_id", user.id).single()

    if (error) throw error

    return data?.data || []
  } catch (error) {
    console.error("Error cargando insumos:", error)
    return []
  }
}

export async function saveInsumos(userId: string, insumos: Insumo[]): Promise<boolean> {
  try {
    const { error } = await supabase.from("insumos").upsert(
      {
        user_id: userId,
        data: insumos,
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error guardando insumos:", error)
    return false
  }
}

export async function deleteInsumo(insumoId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { error } = await supabase.from("insumos").delete().eq("id", insumoId).eq("user_id", user.id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error eliminando insumo:", error)
    return false
  }
}

export async function deleteAllInsumos(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("insumos").delete().eq("user_id", userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error eliminando todos los insumos:", error)
    return false
  }
}

export async function updateCantidadUtilizada(insumoId: string, nuevaCantidad: number): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { error } = await supabase
      .from("insumos")
      .update({
        cantidad_utilizada: Math.max(0, nuevaCantidad),
        updated_at: new Date().toISOString(),
      })
      .eq("id", insumoId)
      .eq("user_id", user.id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error actualizando cantidad utilizada:", error)
    return false
  }
}

export async function createInsumo(insumoData: Omit<Insumo, "id">): Promise<{ success: boolean; insumo?: Insumo }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const nuevoId = generateUUID()
    const nuevoInsumo: Insumo = {
      ...insumoData,
      id: nuevoId,
    }

    const { error } = await supabase.from("insumos").insert({
      id: nuevoId,
      user_id: user.id,
      nombre: insumoData.nombre,
      proveedor: insumoData.proveedor,
      costo_compra: insumoData.costoCompra,
      cantidad_paquetes: insumoData.cantidadPaquetes,
      cantidad_compra: insumoData.cantidadCompra,
      unidad_compra: insumoData.unidadCompra,
      costo_unitario_normalizado: insumoData.costoUnitarioNormalizado,
      cantidad_utilizada: insumoData.cantidadUtilizada,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return { success: true, insumo: nuevoInsumo }
  } catch (error) {
    console.error("Error creando insumo:", error)
    return { success: false }
  }
}

// =============================================
// PRODUCTOS BASE
// =============================================

export async function getProductosBase(): Promise<ProductoBase[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { data, error } = await supabase.from("productos_base").select("data").eq("user_id", user.id).single()

    if (error) throw error

    return data?.data || []
  } catch (error) {
    console.error("Error cargando productos base:", error)
    return []
  }
}

export async function saveProductosBase(userId: string, productos: ProductoBase[]): Promise<boolean> {
  try {
    const { error } = await supabase.from("productos_base").upsert(
      {
        user_id: userId,
        data: productos,
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error guardando productos base:", error)
    return false
  }
}

export async function deleteProductoBase(productoId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { error } = await supabase.from("productos_base").delete().eq("id", productoId).eq("user_id", user.id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error eliminando producto base:", error)
    return false
  }
}

export async function deleteAllProductosBase(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("productos_base").delete().eq("user_id", userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error eliminando todos los productos base:", error)
    return false
  }
}

export async function createProductoBase(
  productoData: Omit<ProductoBase, "id">,
): Promise<{ success: boolean; producto?: ProductoBase }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const nuevoId = generateUUID()
    const nuevoProducto: ProductoBase = {
      ...productoData,
      id: nuevoId,
    }

    const { error } = await supabase.from("productos_base").insert({
      id: nuevoId,
      user_id: user.id,
      nombre: productoData.nombre,
      receta: productoData.receta,
      tiempo_mano_obra_lote: productoData.tiempoManoObraLote,
      rendimiento_lote: productoData.rendimientoLote,
      ultimo_lote: productoData.ultimoLote,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return { success: true, producto: nuevoProducto }
  } catch (error) {
    console.error("Error creando producto base:", error)
    return { success: false }
  }
}

export async function updateUltimoLote(productoId: string, nuevoUltimoLote: number): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { error } = await supabase
      .from("productos_base")
      .update({
        ultimo_lote: nuevoUltimoLote,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productoId)
      .eq("user_id", user.id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error actualizando último lote:", error)
    return false
  }
}

// =============================================
// LOTES
// =============================================

export async function getLotes(): Promise<Lote[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { data, error } = await supabase.from("lotes").select("data").eq("user_id", user.id).single()

    if (error) throw error

    return data?.data || []
  } catch (error) {
    console.error("Error cargando lotes:", error)
    return []
  }
}

export async function saveLotes(userId: string, lotes: Lote[]): Promise<boolean> {
  try {
    const { error } = await supabase.from("lotes").upsert(
      {
        user_id: userId,
        data: lotes,
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error guardando lotes:", error)
    return false
  }
}

export async function deleteLote(loteId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { error } = await supabase.from("lotes").delete().eq("id", loteId).eq("user_id", user.id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error eliminando lote:", error)
    return false
  }
}

export async function deleteAllLotes(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("lotes").delete().eq("user_id", userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error eliminando todos los lotes:", error)
    return false
  }
}

export async function createLote(loteData: Omit<Lote, "id">): Promise<{ success: boolean; lote?: Lote }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const nuevoId = generateUUID()
    const nuevoLote: Lote = {
      ...loteData,
      id: nuevoId,
    }

    const { error } = await supabase.from("lotes").insert({
      id: nuevoId,
      user_id: user.id,
      producto_base_id: loteData.productoBaseId,
      numero_lote: loteData.numeroLote,
      identificador: loteData.identificador,
      costo_total_produccion: loteData.costoTotalProduccion,
      margen_ganancia: loteData.margenGanancia,
      precio_venta_final: loteData.precioVentaFinal,
      receta_usada: loteData.recetaUsada,
      tiempo_mano_obra_usado: loteData.tiempoManoObraUsado,
      rendimiento_usado: loteData.rendimientoUsado,
      unidades_por_paquete: loteData.unidadesPorPaquete,
      precio_venta_por_paquete: loteData.precioVentaPorPaquete,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return { success: true, lote: nuevoLote }
  } catch (error) {
    console.error("Error creando lote:", error)
    return { success: false }
  }
}

export async function getLotesByProductoBase(productoBaseId: string): Promise<Lote[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { data, error } = await supabase
      .from("lotes")
      .select("*")
      .eq("user_id", user.id)
      .eq("producto_base_id", productoBaseId)
      .order("numero_lote", { ascending: false })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      productoBaseId: item.producto_base_id,
      numeroLote: item.numero_lote,
      identificador: item.identificador,
      costoTotalProduccion: item.costo_total_produccion,
      margenGanancia: item.margen_ganancia,
      precioVentaFinal: item.precio_venta_final,
      fechaCreacion: item.created_at,
      recetaUsada: item.receta_usada || [],
      tiempoManoObraUsado: item.tiempo_mano_obra_usado,
      rendimientoUsado: item.rendimiento_usado,
      unidadesPorPaquete: item.unidades_por_paquete,
      precioVentaPorPaquete: item.precio_venta_por_paquete,
    }))
  } catch (error) {
    console.error("Error cargando lotes por producto base:", error)
    return []
  }
}

// =============================================
// ELIMINACIÓN MASIVA
// =============================================

export async function deleteAllUserData(userId: string): Promise<void> {
  try {
    await Promise.all([
      deleteAllInsumos(userId),
      deleteAllProductosBase(userId),
      deleteAllLotes(userId),
      deleteConfiguracion(userId),
    ])
  } catch (error) {
    console.error("Error deleting user data:", error)
    throw error
  }
}

// =============================================
// FUNCIONES DE UTILIDAD
// =============================================

export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: "Usuario no autenticado" }
    }

    // Probar consulta simple
    const { data, error } = await supabase.from("configuracion").select("id").eq("user_id", user.id).limit(1)

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return {
      success: true,
      message: `Conexión exitosa - Usuario: ${user.email}`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// =============================================
// MIGRACIÓN DE DATOS
// =============================================

export async function migrateInsumosToSupabase(insumos: Insumo[]): Promise<{ success: boolean; migrated: number }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    let migrated = 0

    for (const insumo of insumos) {
      const success = await saveInsumo(insumo)
      if (success) {
        migrated++
      }
    }

    return { success: true, migrated }
  } catch (error) {
    console.error("Error migrando insumos:", error)
    return { success: false, migrated: 0 }
  }
}

export async function migrateProductosBaseToSupabase(
  productos: ProductoBase[],
): Promise<{ success: boolean; migrated: number }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    let migrated = 0

    for (const producto of productos) {
      const success = await saveProductoBase(producto)
      if (success) {
        migrated++
      }
    }

    return { success: true, migrated }
  } catch (error) {
    console.error("Error migrando productos base:", error)
    return { success: false, migrated: 0 }
  }
}

export async function migrateLotesToSupabase(lotes: Lote[]): Promise<{ success: boolean; migrated: number }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    let migrated = 0

    for (const lote of lotes) {
      const success = await saveLote(lote)
      if (success) {
        migrated++
      }
    }

    return { success: true, migrated }
  } catch (error) {
    console.error("Error migrando lotes:", error)
    return { success: false, migrated: 0 }
  }
}

// Helper function to save a single insumo
async function saveInsumo(insumo: Insumo): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    // Si el insumo no tiene un UUID válido, generar uno nuevo
    let insumoId = insumo.id
    if (!insumoId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      insumoId = generateUUID()
    }

    const { error } = await supabase.from("insumos").upsert({
      id: insumoId,
      user_id: user.id,
      nombre: insumo.nombre,
      proveedor: insumo.proveedor,
      costo_compra: insumo.costoCompra,
      cantidad_paquetes: insumo.cantidadPaquetes,
      cantidad_compra: insumo.cantidadCompra,
      unidad_compra: insumo.unidadCompra,
      costo_unitario_normalizado: insumo.costoUnitarioNormalizado,
      cantidad_utilizada: insumo.cantidadUtilizada,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error guardando insumo:", error)
    return false
  }
}

// Helper function to save a single producto base
async function saveProductoBase(producto: ProductoBase): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    // Si el producto no tiene un UUID válido, generar uno nuevo
    let productoId = producto.id
    if (!productoId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      productoId = generateUUID()
    }

    const { error } = await supabase.from("productos_base").upsert({
      id: productoId,
      user_id: user.id,
      nombre: producto.nombre,
      receta: producto.receta,
      tiempo_mano_obra_lote: producto.tiempoManoObraLote,
      rendimiento_lote: producto.rendimientoLote,
      ultimo_lote: producto.ultimoLote,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error guardando producto base:", error)
    return false
  }
}

// Helper function to save a single lote
async function saveLote(lote: Lote): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    // Si el lote no tiene un UUID válido, generar uno nuevo
    let loteId = lote.id
    if (!loteId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      loteId = generateUUID()
    }

    const { error } = await supabase.from("lotes").upsert({
      id: loteId,
      user_id: user.id,
      producto_base_id: lote.productoBaseId,
      numero_lote: lote.numeroLote,
      identificador: lote.identificador,
      costo_total_produccion: lote.costoTotalProduccion,
      margen_ganancia: lote.margenGanancia,
      precio_venta_final: lote.precioVentaFinal,
      receta_usada: lote.recetaUsada,
      tiempo_mano_obra_usado: lote.tiempoManoObraUsado,
      rendimiento_usado: lote.rendimientoUsado,
      unidades_por_paquete: lote.unidadesPorPaquete,
      precio_venta_por_paquete: lote.precioVentaPorPaquete,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error guardando lote:", error)
    return false
  }
}
