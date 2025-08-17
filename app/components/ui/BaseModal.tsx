"use client"

import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
    variant?: "default" | "destructive" | "outline"
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  size?: "sm" | "md" | "lg" | "xl"
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  size = "md",
}: BaseModalProps) {
  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
          {subtitle && <DialogDescription className="text-gray-600 mt-1">{subtitle}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {(primaryAction || secondaryAction) && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick} className="w-full sm:w-auto bg-transparent">
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={primaryAction.variant || "default"}
                onClick={primaryAction.onClick}
                disabled={primaryAction.loading}
                className="w-full sm:w-auto"
              >
                {primaryAction.loading ? "Procesando..." : primaryAction.label}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
