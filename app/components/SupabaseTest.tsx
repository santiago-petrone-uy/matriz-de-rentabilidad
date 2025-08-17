"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testConnection } from "@/lib/supabase"
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function SupabaseTest() {
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleTest = async () => {
    setStatus("testing")
    setMessage("")

    try {
      const result = await testConnection()

      if (result.success) {
        setStatus("success")
        setMessage(result.message)
      } else {
        setStatus("error")
        setMessage(result.message)
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error inesperado al conectar")
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "testing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Database className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "testing":
        return (
          <Badge variant="outline" className="text-blue-600">
            Probando...
          </Badge>
        )
      case "success":
        return (
          <Badge variant="outline" className="text-green-600">
            Conectado
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="text-red-600">
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            Sin probar
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Prueba de Conexión Supabase
        </CardTitle>
        <CardDescription>Verifica que la aplicación puede conectarse correctamente a la base de datos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Estado de Conexión</div>
            <div className="text-sm text-gray-600">{message || 'Haz clic en "Probar Conexión" para verificar'}</div>
          </div>
          {getStatusBadge()}
        </div>

        <Button onClick={handleTest} disabled={status === "testing"} className="w-full">
          {status === "testing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Probando Conexión...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Probar Conexión
            </>
          )}
        </Button>

        {status === "success" && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-800">
              ✅ <strong>¡Perfecto!</strong> La aplicación puede conectarse a Supabase correctamente.
              <br />
              <span className="text-green-600">Siguiente paso: Crear las tablas de la base de datos.</span>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-red-800">
              ❌ <strong>Error de conexión.</strong> Verifica:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Variables de entorno configuradas</li>
                <li>URL de Supabase correcta</li>
                <li>Clave anónima válida</li>
                <li>Proyecto Supabase activo</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
