"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CurrencyInput, TimeInput } from "@/components/ui/numeric-inputs"
import { useAppContext } from "../context/AppContext"
import { toast } from "sonner"
import { Calculator, Info } from "lucide-react"

export function ConfiguracionCostos() {
  const { configuracion, setConfiguracion } = useAppContext()
  const [formData, setFormData] = useState(configuracion)

  const tasaAsignacionCIF =
    formData.horasProduccionMensuales > 0 ? formData.costosIndirectosMensuales / formData.horasProduccionMensuales : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setConfiguracion(formData)
    toast.success("Configuración guardada exitosamente")
  }

  const handleInputChange = (field: keyof typeof formData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Costos Indirectos</h1>
          <p className="text-gray-600">
            Define cuánto vale tu trabajo y cuáles son tus gastos fijos mensuales. Con esta información podrás calcular
            el precio real de tus productos y asegurar que siempre tengas ganancia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Configuración de Costos Base
              </CardTitle>
              <CardDescription>
                Define los valores base que se utilizarán para calcular el costo total de producción de todos tus
                productos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 1. Valor hora de mano de obra */}
              <div className="space-y-2">
                <Label htmlFor="valorHora">Valor hora de mano de obra</Label>
                <CurrencyInput
                  id="valorHora"
                  placeholder="250"
                  value={formData.valorHoraProduccion}
                  onChange={(value) => handleInputChange("valorHoraProduccion", value)}
                />
                <p className="text-xs text-gray-600">
                  Cuánto vale tu tiempo de trabajo por hora. Considera tu experiencia, habilidades y el valor que
                  aportas al producto.
                </p>
              </div>

              {/* 2. Horas de trabajo mensuales */}
              <div className="space-y-2">
                <Label htmlFor="horasProduccion">Horas de trabajo mensuales totales</Label>
                <TimeInput
                  id="horasProduccion"
                  placeholder="160"
                  value={formData.horasProduccionMensuales}
                  onChange={(value) => handleInputChange("horasProduccionMensuales", value)}
                />
                <p className="text-xs text-gray-600">
                  Total de horas que dedicas mensualmente a la producción. Incluye preparación, cocción, enfriado y
                  empaque.
                </p>
              </div>

              {/* 3. Costos indirectos mensuales */}
              <div className="space-y-2">
                <Label htmlFor="costosIndirectos">Costos indirectos mensuales totales</Label>
                <CurrencyInput
                  id="costosIndirectos"
                  placeholder="27000"
                  value={formData.costosIndirectosMensuales}
                  onChange={(value) => handleInputChange("costosIndirectosMensuales", value)}
                />
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Incluye gastos como:</p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        <li>Electricidad, gas y agua</li>
                        <li>Alquiler del espacio de trabajo</li>
                        <li>Depreciación de equipos y utensilios</li>
                        <li>Seguros y licencias</li>
                        <li>Mantenimiento y reparaciones</li>
                        <li>Otros gastos fijos del emprendimiento</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado calculado */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">
                  Tasa de Asignación{" "}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">CIF</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Costos Indirectos de Fabricación</p>
                    </TooltipContent>
                  </Tooltip>{" "}
                  por Hora
                </Label>
                <p className="text-2xl font-bold text-gray-900">${tasaAsignacionCIF.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Este valor se aplicará automáticamente a cada hora de trabajo en tus productos
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full">
            Guardar Configuración
          </Button>
        </form>
      </div>
    </TooltipProvider>
  )
}
