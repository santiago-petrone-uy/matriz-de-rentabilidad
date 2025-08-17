import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConfirmProvider } from "./hooks/useConfirm"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Matriz de Rentabilidad - Gestión de Costos",
  description: "Aplicación para gestionar costos, recetas y precios de emprendimientos de comida",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ConfirmProvider>
          {children}
          {/* Toast container will be added by individual components as needed */}
        </ConfirmProvider>
      </body>
    </html>
  )
}
