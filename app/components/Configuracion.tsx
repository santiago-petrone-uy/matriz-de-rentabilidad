"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAppContext } from "../context/AppContext"
import { toast } from "sonner"
import { ExportarDatos } from "./ExportarDatos"

export function Configuracion() {
  const { configuracion, setConfiguracion } = useAppContext()
  const [formData, setFormData] = useState(configuracion)

  const tasaAsignacionCIF =
    formData.horasProduccionMensuales > 0 ? formData.costosIndirectosMensuales / formData.horasProduccionMensuales : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setConfiguracion(formData)
    toast.success("Configuración guardada exitosamente")
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number.parseFloat(value) || 0,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Define las variables globales del sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Costos de Mano de Obra</CardTitle>
            <CardDescription>Define el valor de tu hora de trabajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valorHora">Valor Hora de Producción ($)</Label>
              <Input
                id="valorHora"
                type="number"
                step="0.01"
                placeholder="250"
                value={formData.valorHoraProduccion || ""}
                onChange={(e) => handleInputChange("valorHoraProduccion", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costos Indirectos (CIF)</CardTitle>
            <CardDescription>Configura los costos indirectos de fabricación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="costosIndirectos">Costos Indirectos Fijos Mensuales Totales ($)</Label>
              <Input
                id="costosIndirectos"
                type="number"
                step="0.01"
                placeholder="27000"
                value={formData.costosIndirectosMensuales || ""}
                onChange={(e) => handleInputChange("costosIndirectosMensuales", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horasProduccion">Horas de Producción Mensuales Totales (Hs)</Label>
              <Input
                id="horasProduccion"
                type="number"
                step="0.01"
                placeholder="160"
                value={formData.horasProduccionMensuales || ""}
                onChange={(e) => handleInputChange("horasProduccionMensuales", e.target.value)}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-700">Tasa de Asignación CIF por Hora</Label>
              <p className="text-2xl font-bold text-gray-900">${tasaAsignacionCIF.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Guardar Configuración
        </Button>
      </form>

      <ExportarDatos />
    </div>
  )
}
