"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"

export default function Dashboard() {
  const { insumos, productosBase, lotes } = useAppContext()

  // Calcular métricas
  const totalInsumos = insumos.length
  const totalProductos = productosBase.length
  const totalLotes = lotes.length

  // Calcular valor total del inventario
  const valorInventario = insumos.reduce((total, insumo) => {
    return total + insumo.cantidad * insumo.costoUnitario
  }, 0)

  // Calcular productos con bajo stock (menos de 10 unidades)
  const productosConBajoStock = insumos.filter((insumo) => insumo.cantidad < 10).length

  // Calcular rentabilidad promedio de productos
  const rentabilidadPromedio =
    productosBase.length > 0
      ? productosBase.reduce((total, producto) => {
          const costoTotal = producto.ingredientes.reduce((sum, ing) => {
            const insumo = insumos.find((i) => i.id === ing.insumoId)
            return sum + (insumo ? insumo.costoUnitario * ing.cantidad : 0)
          }, 0)
          const margen =
            producto.precioVenta > 0 ? ((producto.precioVenta - costoTotal) / producto.precioVenta) * 100 : 0
          return total + margen
        }, 0) / productosBase.length
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de tu negocio de comida</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor del Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${valorInventario.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">Total en materias primas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Materias Primas</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalInsumos}</div>
            <p className="text-xs text-gray-600 mt-1">Insumos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Productos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalProductos}</div>
            <p className="text-xs text-gray-600 mt-1">Recetas creadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rentabilidad Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{rentabilidadPromedio.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1">Margen de ganancia</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado del Negocio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Estado de Mi Negocio</span>
            </CardTitle>
            <CardDescription>Métricas clave de tu emprendimiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{totalLotes}</div>
                <div className="text-sm text-gray-600">Lotes Producidos</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{productosConBajoStock}</div>
                <div className="text-sm text-gray-600">Stock Bajo</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">
                  ${(valorInventario / Math.max(totalInsumos, 1)).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Costo Promedio</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">
                  {totalProductos > 0 ? Math.round(totalLotes / totalProductos) : 0}
                </div>
                <div className="text-sm text-gray-600">Lotes por Producto</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas y Notificaciones</span>
            </CardTitle>
            <CardDescription>Elementos que requieren tu atención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {productosConBajoStock > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">Stock Bajo</p>
                  <p className="text-xs text-orange-600">{productosConBajoStock} insumos con menos de 10 unidades</p>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {productosConBajoStock}
                </Badge>
              </div>
            )}

            {totalProductos === 0 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Comenzar con Productos</p>
                  <p className="text-xs text-blue-600">Crea tu primera receta para empezar</p>
                </div>
              </div>
            )}

            {totalInsumos === 0 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Agregar Materias Primas</p>
                  <p className="text-xs text-blue-600">Registra tus primeros insumos</p>
                </div>
              </div>
            )}

            {totalInsumos > 0 && totalProductos > 0 && productosConBajoStock === 0 && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Todo en Orden</p>
                  <p className="text-xs text-green-600">No hay alertas pendientes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progreso de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Configuración</CardTitle>
          <CardDescription>Completa estos pasos para optimizar tu gestión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Configuración Básica</span>
              <span>{Math.round((((totalInsumos > 0 ? 1 : 0) + (totalProductos > 0 ? 1 : 0)) / 2) * 100)}%</span>
            </div>
            <Progress value={(((totalInsumos > 0 ? 1 : 0) + (totalProductos > 0 ? 1 : 0)) / 2) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-3">
              {totalInsumos > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              <span className={`text-sm ${totalInsumos > 0 ? "text-green-800" : "text-gray-600"}`}>
                Materias primas registradas
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {totalProductos > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              <span className={`text-sm ${totalProductos > 0 ? "text-green-800" : "text-gray-600"}`}>
                Productos creados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
