"use client"

// Sistema de gestión y migración de datos
export interface DataVersion {
  version: string
  timestamp: string
  data: {
    configuracion: any
    insumos: any[]
    productos: any[]
  }
}

export class DataManager {
  private static readonly CURRENT_VERSION = "2.0.0"
  private static readonly STORAGE_KEYS = {
    configuracion: "food-business-configuracion",
    insumos: "food-business-insumos",
    productos: "food-business-productos", // Mantener para migración
    productosBase: "food-business-productos-base",
    lotes: "food-business-lotes",
    version: "food-business-version",
    backup: "food-business-backup",
    migrations: "food-business-migrations",
  }

  // Crear backup automático antes de cualquier operación
  static createBackup(): void {
    try {
      const currentData = {
        version: this.CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        data: {
          configuracion: this.getStoredData(this.STORAGE_KEYS.configuracion),
          insumos: this.getStoredData(this.STORAGE_KEYS.insumos),
          productos: this.getStoredData(this.STORAGE_KEYS.productos),
        },
      }

      // Guardar backup con timestamp
      const backupKey = `${this.STORAGE_KEYS.backup}-${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(currentData))

      // Mantener solo los últimos 10 backups
      this.cleanOldBackups()

      console.log("✅ Backup creado exitosamente:", backupKey)
    } catch (error) {
      console.error("❌ Error creando backup:", error)
    }
  }

  // Limpiar backups antiguos (mantener solo los últimos 10)
  private static cleanOldBackups(): void {
    try {
      const backupKeys = Object.keys(localStorage).filter((key) => key.startsWith(this.STORAGE_KEYS.backup))

      if (backupKeys.length > 10) {
        // Ordenar por timestamp y eliminar los más antiguos
        backupKeys
          .sort()
          .slice(0, backupKeys.length - 10)
          .forEach((key) => localStorage.removeItem(key))
      }
    } catch (error) {
      console.error("Error limpiando backups:", error)
    }
  }

  // Migrar datos de versiones anteriores
  static migrateData(): void {
    const currentVersion = localStorage.getItem(this.STORAGE_KEYS.version)

    if (!currentVersion || currentVersion !== this.CURRENT_VERSION) {
      console.log("🔄 Iniciando migración de datos...")

      // Crear backup antes de migrar
      this.createBackup()

      // Ejecutar migraciones según la versión
      this.runMigrations(currentVersion)

      // Actualizar versión
      localStorage.setItem(this.STORAGE_KEYS.version, this.CURRENT_VERSION)

      console.log("✅ Migración completada a versión:", this.CURRENT_VERSION)
    }
  }

  // Ejecutar migraciones específicas
  private static runMigrations(fromVersion: string | null): void {
    const migrations = this.getMigrationHistory()

    // Migración desde versión sin cantidadPaquetes (v1.0.0) a v1.2.0
    if (!fromVersion || fromVersion < "1.2.0") {
      this.migrateToV120()
      migrations.push({
        from: fromVersion || "1.0.0",
        to: "1.2.0",
        timestamp: new Date().toISOString(),
        description: "Agregado campo cantidadPaquetes a insumos",
      })
    }

    // Migración de productos a nueva estructura ProductoBase + LoteProducto
    if (!fromVersion || fromVersion < "2.0.0") {
      this.migrateToV200()
      migrations.push({
        from: fromVersion || "1.2.0",
        to: "2.0.0",
        timestamp: new Date().toISOString(),
        description: "Reestructuración de productos: ProductoBase + LoteProducto",
      })
    }

    // Guardar historial de migraciones
    localStorage.setItem(this.STORAGE_KEYS.migrations, JSON.stringify(migrations))
  }

  // Migración específica a versión 1.2.0
  private static migrateToV120(): void {
    try {
      const insumos = this.getStoredData(this.STORAGE_KEYS.insumos) || []

      const insumosActualizados = insumos.map((insumo: any) => {
        // Si no tiene cantidadPaquetes, agregarlo con valor por defecto
        if (!insumo.hasOwnProperty("cantidadPaquetes")) {
          return {
            ...insumo,
            cantidadPaquetes: 1, // Valor por defecto
          }
        }
        return insumo
      })

      // Guardar insumos actualizados
      localStorage.setItem(this.STORAGE_KEYS.insumos, JSON.stringify(insumosActualizados))

      console.log("✅ Insumos migrados a v1.2.0:", insumosActualizados.length)
    } catch (error) {
      console.error("❌ Error en migración v1.2.0:", error)
    }
  }

  // Migración específica a versión 2.0.0
  private static migrateToV200(): void {
    try {
      const productosAntiguos = this.getStoredData(this.STORAGE_KEYS.productos) || []

      if (productosAntiguos.length === 0) {
        console.log("✅ No hay productos antiguos para migrar")
        return
      }

      const productosBaseMigrados: any[] = []
      const lotesMigrados: any[] = []

      // Agrupar productos antiguos por nombre para crear ProductoBase
      const gruposPorNombre = productosAntiguos.reduce((grupos: any, producto: any) => {
        if (!grupos[producto.nombre]) {
          grupos[producto.nombre] = []
        }
        grupos[producto.nombre].push(producto)
        return grupos
      }, {})

      Object.entries(gruposPorNombre).forEach(([nombre, productos]: [string, any[]]) => {
        // Usar el primer producto como base para el ProductoBase
        const primerProducto = productos[0]
        const productoBaseId = `pb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const productoBase = {
          id: productoBaseId,
          nombre,
          receta: primerProducto.receta || [],
          tiempoManoObraLote: primerProducto.tiempoManoObraLote || 0,
          rendimientoLote: primerProducto.rendimientoLote || 1,
          fechaCreacion: primerProducto.fechaCreacion || new Date().toISOString(),
          ultimoLote: productos.length,
        }

        productosBaseMigrados.push(productoBase)

        // Crear lotes para cada producto antiguo
        productos.forEach((producto: any, index: number) => {
          const lote = {
            id: producto.id,
            productoBaseId,
            numeroLote: String(index + 1).padStart(2, "0"),
            identificador:
              producto.identificador ||
              this.generarIdentificador(producto.nombre, producto.fechaCreacion || new Date().toISOString()),
            costoTotalProduccion: producto.costoTotalProduccion || 0,
            margenGanancia: producto.margenGanancia || 0,
            precioVentaFinal: producto.precioVentaFinal || 0,
            fechaCreacion: producto.fechaCreacion || new Date().toISOString(),
            recetaUsada: producto.receta || [],
            tiempoManoObraUsado: producto.tiempoManoObraLote || 0,
            rendimientoUsado: producto.rendimientoLote || 1,
          }

          lotesMigrados.push(lote)
        })
      })

      // Guardar nuevas estructuras
      localStorage.setItem(this.STORAGE_KEYS.productosBase, JSON.stringify(productosBaseMigrados))
      localStorage.setItem(this.STORAGE_KEYS.lotes, JSON.stringify(lotesMigrados))

      console.log("✅ Productos migrados a v2.0.0:", {
        productosBase: productosBaseMigrados.length,
        lotes: lotesMigrados.length,
      })
    } catch (error) {
      console.error("❌ Error en migración v2.0.0:", error)
    }
  }

  // Función auxiliar para generar identificador
  private static generarIdentificador(nombre: string, fecha: string): string {
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

  // Obtener historial de migraciones
  private static getMigrationHistory(): any[] {
    try {
      const history = localStorage.getItem(this.STORAGE_KEYS.migrations)
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  }

  // Obtener datos del localStorage de forma segura
  private static getStoredData(key: string): any {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  // Guardar datos con backup automático
  static saveData(key: string, data: any): void {
    try {
      // Crear backup antes de guardar
      this.createBackup()

      // Guardar datos
      localStorage.setItem(key, JSON.stringify(data))

      console.log("💾 Datos guardados:", key)
    } catch (error) {
      console.error("❌ Error guardando datos:", error)
      throw error
    }
  }

  // Cargar datos con migración automática
  static loadData(key: string, defaultValue: any = null): any {
    try {
      // Ejecutar migraciones si es necesario
      this.migrateData()

      // Cargar datos
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
      return defaultValue
    }
  }

  // Exportar todos los datos con metadatos
  static exportAllData(): string {
    const exportData = {
      version: this.CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      appName: "Accediendo a tu herramienta para calcular costos (MdR)",
      data: {
        configuracion: this.getStoredData(this.STORAGE_KEYS.configuracion),
        insumos: this.getStoredData(this.STORAGE_KEYS.insumos) || [],
        productosBase: this.getStoredData(this.STORAGE_KEYS.productosBase) || [],
        lotes: this.getStoredData(this.STORAGE_KEYS.lotes) || [],
        // Mantener productos antiguos para compatibilidad
        productos: this.getStoredData(this.STORAGE_KEYS.productos) || [],
      },
      migrations: this.getMigrationHistory(),
    }

    return JSON.stringify(exportData, null, 2)
  }

  // Importar datos con validación
  static importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData)

      // Validar estructura
      if (!importedData.data) {
        throw new Error("Estructura de datos inválida")
      }

      // Crear backup antes de importar
      this.createBackup()

      // Importar datos
      if (importedData.data.configuracion) {
        localStorage.setItem(this.STORAGE_KEYS.configuracion, JSON.stringify(importedData.data.configuracion))
      }
      if (importedData.data.insumos && Array.isArray(importedData.data.insumos)) {
        localStorage.setItem(this.STORAGE_KEYS.insumos, JSON.stringify(importedData.data.insumos))
      }

      // Importar nueva estructura si existe
      if (importedData.data.productosBase && Array.isArray(importedData.data.productosBase)) {
        localStorage.setItem(this.STORAGE_KEYS.productosBase, JSON.stringify(importedData.data.productosBase))
      }
      if (importedData.data.lotes && Array.isArray(importedData.data.lotes)) {
        localStorage.setItem(this.STORAGE_KEYS.lotes, JSON.stringify(importedData.data.lotes))
      }

      // Importar estructura antigua si existe (para migración)
      if (importedData.data.productos && Array.isArray(importedData.data.productos)) {
        localStorage.setItem(this.STORAGE_KEYS.productos, JSON.stringify(importedData.data.productos))
      }

      // Ejecutar migraciones si es necesario
      this.migrateData()

      console.log("✅ Datos importados exitosamente")
      return true
    } catch (error) {
      console.error("❌ Error importando datos:", error)
      return false
    }
  }

  // Obtener información del sistema
  static getSystemInfo(): any {
    return {
      version: this.CURRENT_VERSION,
      lastBackup: this.getLastBackupDate(),
      totalBackups: this.getBackupCount(),
      migrations: this.getMigrationHistory(),
      dataSize: this.calculateDataSize(),
    }
  }

  private static getLastBackupDate(): string | null {
    try {
      const backupKeys = Object.keys(localStorage).filter((key) => key.startsWith(this.STORAGE_KEYS.backup))
      if (backupKeys.length === 0) return null

      const lastBackupKey = backupKeys.sort().pop()
      const backupData = JSON.parse(localStorage.getItem(lastBackupKey!) || "{}")
      return backupData.timestamp || null
    } catch {
      return null
    }
  }

  private static getBackupCount(): number {
    return Object.keys(localStorage).filter((key) => key.startsWith(this.STORAGE_KEYS.backup)).length
  }

  private static calculateDataSize(): string {
    try {
      let totalSize = 0
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("food-business")) {
          totalSize += localStorage.getItem(key)?.length || 0
        }
      })
      return `${(totalSize / 1024).toFixed(2)} KB`
    } catch {
      return "N/A"
    }
  }

  // Restaurar desde backup
  static restoreFromBackup(backupKey: string): boolean {
    try {
      const backupData = localStorage.getItem(backupKey)
      if (!backupData) return false

      const backup = JSON.parse(backupData)
      return this.importData(JSON.stringify(backup))
    } catch (error) {
      console.error("❌ Error restaurando backup:", error)
      return false
    }
  }

  // Listar backups disponibles
  static getAvailableBackups(): Array<{ key: string; date: string; version: string }> {
    try {
      const backupKeys = Object.keys(localStorage).filter((key) => key.startsWith(this.STORAGE_KEYS.backup))

      return backupKeys
        .map((key) => {
          try {
            const backup = JSON.parse(localStorage.getItem(key) || "{}")
            return {
              key,
              date: backup.timestamp || "Fecha desconocida",
              version: backup.version || "Versión desconocida",
            }
          } catch {
            return null
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime()) as Array<{
        key: string
        date: string
        version: string
      }>
    } catch {
      return []
    }
  }
}
