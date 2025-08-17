"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Calculator,
  BookOpen,
  DollarSign,
  Package,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
  X,
  Check,
} from "lucide-react"

export function Documentacion() {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guía Completa de Cálculos</h1>
          <p className="text-gray-600">Todo lo que necesitas saber para dominar tu matriz de rentabilidad</p>
        </div>

        {/* Introducción Motivacional */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Target className="mr-2 h-5 w-5" />
              ¿Por qué es importante calcular bien tus costos?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-800">
              <strong>Imaginate esto:</strong> Preparas 12 muffins deliciosos, los vendes a $150 cada uno y crees que
              ganaste $1,800. Pero cuando calculas bien todos los costos, descubres que cada muffin te costó $120 hacer.
              <strong> Solo ganaste $30 por muffin, no los $150 que pensabas.</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <X className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Sin calcular costos</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Vendes "a ojo", a veces ganas, a veces pierdes. No sabes por qué algunos meses son buenos y otros
                  malos.
                </p>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <Check className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Con costos calculados</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Sabes exactamente cuánto cobrar para tener la ganancia que quieres. Cada venta es rentable.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Lightbulb className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-semibold text-gray-800">La clave del éxito</h4>
              </div>
              <p className="text-sm text-gray-600">
                Esta guía te enseña el sistema que usan las empresas exitosas: <strong>costeo por absorción</strong>.
                Suena complicado, pero es simplemente sumar TODOS los costos para saber el precio real de tus productos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Los 3 Pilares del Costo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Los 3 Pilares de tu Costo Real
            </CardTitle>
            <CardDescription>
              Cada producto que haces tiene estos tres costos. Si olvidas alguno, vendes a pérdida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">
              <strong>Pensalo como construir una casa:</strong> necesitas materiales, mano de obra y gastos generales.
              En tu emprendimiento es igual:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <Package className="h-6 w-6 text-gray-600 mr-3" />
                  <h4 className="font-semibold text-gray-900">1. Materias Primas</h4>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>¿Qué es?</strong> Todo lo que compras para hacer tu producto: harina, azúcar, huevos, etc.
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>¿Cómo se calcula?</strong> Cuánto pagaste por cada ingrediente ÷ cuánto usas en la receta.
                </p>
                <div className="p-3 bg-white rounded border text-xs text-gray-800">
                  <strong>Ejemplo:</strong> Compraste 1kg de harina a $500. Para hacer 12 muffins usas 200g. Costo =
                  $500 ÷ 1000g × 200g = $100
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-gray-600 mr-3" />
                  <h4 className="font-semibold text-gray-900">2. Tu Trabajo</h4>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>¿Qué es?</strong> El valor de tu tiempo: preparar, cocinar, enfriar, empacar.
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>¿Cómo se calcula?</strong> Horas que trabajas × cuánto vale tu hora.
                </p>
                <div className="p-3 bg-white rounded border text-xs text-gray-800">
                  <strong>Ejemplo:</strong> Tardas 2.5 horas en hacer un lote y tu hora vale $250. Costo = 2.5h × $250 =
                  $625 para todo el lote
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <Calculator className="h-6 w-6 text-gray-600 mr-3" />
                  <h4 className="font-semibold text-gray-900">3. Gastos Fijos</h4>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>¿Qué es?</strong> Lo que pagas cada mes: luz, gas, alquiler, equipos.
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>¿Cómo se calcula?</strong> Gastos mensuales ÷ horas que trabajas al mes.
                </p>
                <div className="p-3 bg-white rounded border text-xs text-gray-800">
                  <strong>Ejemplo:</strong> Gastas $27,000/mes y trabajas 160h/mes. Por hora = $27,000 ÷ 160h =
                  $168.75/hora
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paso a Paso: Cálculo de Materias Primas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Paso 1: Calcular el Costo de tus Materias Primas
            </CardTitle>
            <CardDescription>
              Aprende a calcular cuánto te cuesta cada gramo, mililitro o unidad que usas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">La Fórmula Mágica:</h4>
              <div className="bg-white p-3 rounded border font-mono text-center text-lg">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Costo por Gramo</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Costo Unitario Normalizado (CUN)</p>
                  </TooltipContent>
                </Tooltip>{" "}
                = Lo que pagaste ÷ Cuántos gramos compraste
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">¿Cómo lo haces?</h4>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div>
                    <strong>Anota cuánto pagaste:</strong>
                    <div className="text-sm text-gray-600 mt-1">Ejemplo: Compraste fécula de mandioca por $2,125</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div>
                    <strong>Calcula cuánto compraste en total:</strong>
                    <div className="text-sm text-gray-600 mt-1">Ejemplo: 1 bolsa × 25 kilos = 25 kilos total</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div>
                    <strong>Convierte todo a la unidad más pequeña:</strong>
                    <div className="text-sm text-gray-600 mt-1">
                      • Kilos → Gramos: multiplica × 1000
                      <br />• Litros → Mililitros: multiplica × 1000
                      <br />• Ejemplo: 25 kilos = 25,000 gramos
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">
                    4
                  </Badge>
                  <div>
                    <strong>Divide y listo:</strong>
                    <div className="text-sm text-gray-600 mt-1">
                      $2,125 ÷ 25,000 gramos = <strong>$0.085 por gramo</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-gray-400 pl-4 bg-gray-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-gray-900 mb-2">💡 Ejemplo Completo - Muffins Sin TACC</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Receta para 12 muffins:</strong>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>• Fécula: 200g × $0.085 = $17.00</p>
                    <p>• Azúcar: 150g × $0.012 = $1.80</p>
                    <p>• Huevos: 3 unidades × $50 = $150</p>
                  </div>
                  <div className="border-l pl-4">
                    <p className="font-semibold text-gray-900">Total materias primas: $168.80</p>
                    <p className="text-xs text-gray-600">Por muffin: $168.80 ÷ 12 = $14.07</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Costos Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Paso 2: Configurar tus Costos Base
            </CardTitle>
            <CardDescription>Define cuánto vale tu trabajo y cuáles son tus gastos fijos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">¿Cuánto vale tu hora de trabajo?</h4>
                <p className="text-sm text-gray-600">
                  <strong>No regales tu tiempo.</strong> Considera tu experiencia, habilidades y el valor que aportas.
                  Si no sabes por dónde empezar, piensa: ¿cuánto cobrarías por hora si trabajaras para otro?
                </p>
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Sugerencia:</strong> Entre $200 y $400 por hora es un rango razonable para emprendedores
                  gastronómicos.
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Tus gastos fijos mensuales</h4>
                <p className="text-sm text-gray-600">
                  <strong>Todo cuenta.</strong> Anota todos los gastos que tienes cada mes, aunque no los uses solo para
                  cocinar.
                </p>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <strong>Incluye:</strong> Electricidad, gas, agua, alquiler del espacio, internet, seguros,
                  depreciación de equipos, mantenimiento, licencias, etc.
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">🧮 Cálculo Automático</h4>
              <p className="text-sm text-gray-700">
                Una vez que ingreses estos datos, el sistema calculará automáticamente cuánto te cuesta cada hora de
                trabajo en gastos fijos. Esto se llama "Tasa de Asignación CIF" (no te preocupes por el nombre técnico).
              </p>
              <div className="mt-2 p-2 bg-white rounded text-xs border">
                <strong>Ejemplo:</strong> Si gastas $27,000/mes y trabajas 160 horas/mes, cada hora te cuesta $168.75 en
                gastos fijos.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cálculo Final del Producto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Paso 3: El Costo Real de tu Producto
            </CardTitle>
            <CardDescription>Suma todo y descubre cuánto te cuesta realmente hacer cada unidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">La Fórmula Final:</h4>
              <div className="bg-white p-3 rounded border font-mono text-center text-lg">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Costo Real</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Costo Total de Producción (CTP)</p>
                  </TooltipContent>
                </Tooltip>{" "}
                = Materias Primas + Tu Trabajo + Gastos Fijos
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">¿Cómo se calcula cada parte?</h4>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Materias Primas por unidad:</h5>
                  <div className="text-sm text-gray-700">
                    Suma el costo de todos los ingredientes y divide por cuántas unidades haces.
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Tu trabajo por unidad:</h5>
                  <div className="text-sm text-gray-700">
                    (Horas que trabajas × Valor de tu hora) ÷ Cuántas unidades haces
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Gastos fijos por unidad:</h5>
                  <div className="text-sm text-gray-700">
                    (Horas que trabajas × Costo por hora de gastos fijos) ÷ Cuántas unidades haces
                  </div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-gray-400 pl-4 bg-gray-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🎯 Ejemplo Completo - Muffin Sin TACC</h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>Materias primas:</strong> $14.07
                    </p>
                    <p>
                      <strong>Tu trabajo:</strong> $52.08
                    </p>
                    <p>
                      <strong>Gastos fijos:</strong> $35.16
                    </p>
                  </div>
                  <div className="border-l pl-4">
                    <p className="text-lg font-bold text-gray-900">Costo real: $101.31 por muffin</p>
                    <p className="text-xs text-gray-600">¡Este es el precio mínimo que necesitas cobrar!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estrategia de Precios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Paso 4: Define tu Precio de Venta
            </CardTitle>
            <CardDescription>Ahora que sabes tu costo real, decide cuánto quieres ganar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">🎯 La Regla de Oro</h4>
              <p className="text-sm text-gray-700">
                <strong>Nunca vendas por debajo de tu costo real.</strong> Si tu muffin te cuesta $101.31, ese es tu
                precio mínimo. Todo lo que cobres arriba de eso es tu ganancia.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">¿Cómo calcular tu precio de venta?</h4>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Método 1: Por margen de ganancia</h5>
                <div className="text-sm text-gray-700 mb-2">
                  Decides qué porcentaje quieres ganar y el sistema calcula el precio automáticamente.
                </div>
                <div className="p-2 bg-white rounded text-xs text-gray-800 border">
                  <strong>Ejemplo:</strong> Quieres 40% de ganancia en un muffin que cuesta $101.31
                  <br />
                  Precio = $101.31 ÷ (1 - 0.40) = $101.31 ÷ 0.60 = <strong>$168.85</strong>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Método 2: Por precio fijo</h5>
                <div className="text-sm text-gray-700 mb-2">
                  Decides cuánto quieres cobrar y el sistema te dice qué margen tendrás.
                </div>
                <div className="p-2 bg-white rounded text-xs text-gray-800 border">
                  <strong>Ejemplo:</strong> Quieres vender el muffin a $180
                  <br />
                  Ganancia = $180 - $101.31 = $78.69
                  <br />
                  Margen = ($78.69 ÷ $180) × 100 = <strong>43.7%</strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Consejos para definir tu precio</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Investiga qué cobran otros emprendedores similares</li>
                    <li>Considera el valor que aportas (sin TACC, artesanal, etc.)</li>
                    <li>Empieza con márgenes del 30-50% y ajusta según la demanda</li>
                    <li>Recuerda: es mejor vender menos a buen precio que mucho sin ganancia</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consejos Importantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Consejos para el Éxito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                <h4 className="font-semibold text-gray-900 mb-2">🔄 Actualiza regularmente</h4>
                <p className="text-sm text-gray-700">
                  Los precios de las materias primas cambian. Revisa y actualiza tus costos cada 2-3 meses para mantener
                  la precisión.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                <h4 className="font-semibold text-gray-900 mb-2">⏱️ Mide bien tu tiempo</h4>
                <p className="text-sm text-gray-700">
                  Incluye TODO: preparación, cocción, enfriado, empaque y limpieza. Un tiempo preciso es crucial para
                  costos exactos.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                <h4 className="font-semibold text-gray-900 mb-2">💡 No olvides gastos</h4>
                <p className="text-sm text-gray-700">
                  Anota TODOS los gastos fijos: electricidad, gas, alquiler, equipos, seguros, etc. Si no los incluyes,
                  vendes a pérdida sin darte cuenta.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                <h4 className="font-semibold text-gray-900 mb-2">🎯 Conoce tu mercado</h4>
                <p className="text-sm text-gray-700">
                  El precio calculado es tu base, pero considera la competencia y el valor percibido para el precio
                  final.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Fórmulas */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen: Las Fórmulas que Necesitas</CardTitle>
            <CardDescription>Guarda esta sección como referencia rápida</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                <strong>Costo por gramo/ml:</strong> Precio pagado ÷ (Cantidad × Paquetes × Factor conversión)
              </div>
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                <strong>Costo por hora de gastos fijos:</strong> Gastos mensuales ÷ Horas trabajadas al mes
              </div>
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                <strong>Costo real del producto:</strong> (Materias primas + Trabajo + Gastos fijos) ÷ Unidades
                producidas
              </div>
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                <strong>Precio con margen:</strong> Costo real ÷ (1 - Margen deseado %)
              </div>
              <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                <strong>Margen real:</strong> ((Precio venta - Costo real) ÷ Precio venta) × 100
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
