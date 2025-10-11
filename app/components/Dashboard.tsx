"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAppContext } from "../context/AppContext"
import { Package, ChefHat, TrendingUp, Calculator, Info } from "lucide-react"

export function Dashboard() {
  const { insumos, productosBase, lotes, obtenerUltimoLote } = useAppContext()

  // Calcular producto más rentable basado en últimos lotes
  const productoMasRentable = productosBase.reduce((max, productoBase) => {
    const ultimoLote = obtenerUltimoLote(productoBase.id)
    if (!ultimoLote) return max

    const maxUltimoLote = max ? obtenerUltimoLote(max.id) : null
    const maxMargen = maxUltimoLote?.margenGanancia || 0

    return ultimoLote.margenGanancia > maxMargen ? productoBase : max
  }, productosBase[0])

  const productoMasRentableUltimoLote = productoMasRentable ? obtenerUltimoLote(productoMasRentable.id) : null

  // Top 5 productos por costo (basado en últimos lotes)
  const top5ProductosCostosos = productosBase
    .map((productoBase) => {
      const ultimoLote = obtenerUltimoLote(productoBase.id)
      return ultimoLote
        ? {
            nombre: productoBase.nombre,
            costo: ultimoLote.costoTotalProduccion,
          }
        : null
    })
    .filter(Boolean)
    .sort((a, b) => b!.costo - a!.costo)
    .slice(0, 5) as { nombre: string; costo: number }[]

  const chartConfig = {
    costo: {
      label: "Costo Total de Producción",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inicio</h1>
          <p className="text-gray-600">Bienvenido al centro de control de tu negocio</p>
        </div>

        {/* Métricas movidas arriba */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productosBase.length}</div>
              <p className="text-xs text-muted-foreground">Productos creados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Materias Primas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insumos.length}</div>
              <p className="text-xs text-muted-foreground">Materias primas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Producto Más Rentable</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productoMasRentableUltimoLote ? `${productoMasRentableUltimoLote.margenGanancia.toFixed(1)}%` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">{productoMasRentable?.nombre || "Sin productos"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Introducción al Sistema de Costos */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Info className="mr-2 h-5 w-5" />
              ¿Cómo funciona la Matriz de Rentabilidad?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Esta herramienta calcula automáticamente el costo real de cada producto, asegurando que cada venta genere
              ganancia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Cada vez que se crea un producto, el sistema suma <strong>tres componentes clave</strong> para determinar
              el precio mínimo sugerido:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => (window.location.href = "#configuracion-costos")}
              >
                <div className="flex items-center mb-2">
                  <Calculator className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Costos Indirectos</h4>
                </div>
                <p className="text-sm text-gray-600">Tiempo de trabajo, electricidad, gas y gastos operativos.</p>
              </div>

              <div
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => (window.location.href = "#insumos")}
              >
                <div className="flex items-center mb-2">
                  <Package className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Materias Primas</h4>
                </div>
                <p className="text-sm text-gray-600">Costos de las materias primas utilizadas en cada receta.</p>
              </div>

              <div
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => (window.location.href = "#productos")}
              >
                <div className="flex items-center mb-2">
                  <ChefHat className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Productos</h4>
                </div>
                <p className="text-sm text-gray-600">Gestiona recetas, costos y márgenes de tus productos.</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                💡 <strong>Sugerencia:</strong> Comienza configurando los Costos Indirectos y, a continuación, carga las
                materias primas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico existente */}
        {top5ProductosCostosos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Top 5 Productos por{" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Costo de Producción</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Costo Total de Producción</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Los productos con mayor costo total de producción</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5ProductosCostosos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nombre"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="costo" fill="var(--color-costo)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
