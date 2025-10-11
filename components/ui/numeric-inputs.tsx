"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Componente base para todos los inputs numéricos
interface NumericInputProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  allowDecimals?: boolean
  decimalPlaces?: number
  className?: string
  disabled?: boolean
  id?: string
  autoFocus?: boolean
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ allowDecimals = true, decimalPlaces = 2, onChange, value, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(value?.toString() || "")

    // Sincronizar con el valor externo
    React.useEffect(() => {
      setDisplayValue(value?.toString() || "")
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value

      if (allowDecimals) {
        // Permitir números decimales
        inputValue = inputValue.replace(/[^0-9.]/g, "")

        // Evitar múltiples puntos decimales
        const parts = inputValue.split(".")
        if (parts.length > 2) {
          inputValue = parts[0] + "." + parts.slice(1).join("")
        }

        // Limitar decimales si se especifica
        if (parts.length === 2 && decimalPlaces !== undefined) {
          parts[1] = parts[1].substring(0, decimalPlaces)
          inputValue = parts.join(".")
        }
      } else {
        // Solo enteros
        inputValue = inputValue.replace(/[^0-9]/g, "")
      }

      setDisplayValue(inputValue)

      // Convertir a número y llamar onChange
      const numericValue = allowDecimals ? Number.parseFloat(inputValue) || 0 : Number.parseInt(inputValue) || 0

      onChange(numericValue)
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        inputMode={allowDecimals ? "decimal" : "numeric"}
        className={className}
      />
    )
  },
)
NumericInput.displayName = "NumericInput"

// Componente especializado para monedas
interface CurrencyInputProps extends Omit<NumericInputProps, "allowDecimals" | "decimalPlaces"> {
  currency?: string
  showSymbol?: boolean
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ currency = "$", showSymbol = true, className, ...props }, ref) => {
    return (
      <div className="relative">
        {showSymbol && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium z-10">
            {currency}
          </span>
        )}
        <NumericInput
          {...props}
          ref={ref}
          allowDecimals={true}
          decimalPlaces={2}
          className={cn(showSymbol ? "pl-8" : "", className)}
        />
      </div>
    )
  },
)
CurrencyInput.displayName = "CurrencyInput"

// Componente especializado para enteros
interface IntegerInputProps extends Omit<NumericInputProps, "allowDecimals" | "decimalPlaces"> {}

export const IntegerInput = React.forwardRef<HTMLInputElement, IntegerInputProps>((props, ref) => {
  return <NumericInput {...props} ref={ref} allowDecimals={false} />
})
IntegerInput.displayName = "IntegerInput"

// Componente especializado para tiempo
interface TimeInputProps extends Omit<NumericInputProps, "allowDecimals" | "decimalPlaces"> {
  unit?: string
  showUnit?: boolean
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ unit = "hs", showUnit = true, className, ...props }, ref) => {
    return (
      <div className="relative">
        <NumericInput
          {...props}
          ref={ref}
          allowDecimals={true}
          decimalPlaces={1}
          className={cn(showUnit ? "pr-12" : "", className)}
        />
        {showUnit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">{unit}</span>
        )}
      </div>
    )
  },
)
TimeInput.displayName = "TimeInput"

// Componente especializado para cantidades con unidades
interface QuantityInputProps extends Omit<NumericInputProps, "decimalPlaces"> {
  unit?: string
  showUnit?: boolean
}

export const QuantityInput = React.forwardRef<HTMLInputElement, QuantityInputProps>(
  ({ unit, showUnit = true, className, allowDecimals = true, ...props }, ref) => {
    return (
      <div className="relative">
        <NumericInput
          {...props}
          ref={ref}
          allowDecimals={allowDecimals}
          decimalPlaces={allowDecimals ? 2 : 0}
          className={cn(showUnit && unit ? "pr-12" : "", className)}
        />
        {showUnit && unit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">{unit}</span>
        )}
      </div>
    )
  },
)
QuantityInput.displayName = "QuantityInput"
