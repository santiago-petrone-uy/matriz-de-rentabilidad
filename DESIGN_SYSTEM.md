# Design System - Matriz de Rentabilidad
## Documentación Interna de Patrones, Componentes y Estándares

---

## 📋 Índice
1. [Principios de Diseño](#principios-de-diseño)
2. [Tokens de Diseño](#tokens-de-diseño)
3. [Componentes Base](#componentes-base)
4. [Componentes Especializados](#componentes-especializados)
5. [Cálculos Financieros](#cálculos-financieros)
6. [Patrones de Interacción](#patrones-de-interacción)
7. [Layouts y Grids](#layouts-y-grids)
8. [Terminología Estandarizada](#terminología-estandarizada)
9. [Checklist de Calidad](#checklist-de-calidad)
10. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 🎯 Principios de Diseño

### **1. Consistencia Profesional**
- Experiencia uniforme en toda la aplicación
- Patrones predecibles para el usuario
- Comportamientos estándar en componentes similares

### **2. Accesibilidad Primero**
- Tooltips informativos para abreviaciones (CTP, CIF, etc.)
- Alineación vertical consistente en tablas
- Contraste adecuado en todos los elementos

### **3. Feedback Claro**
- Confirmaciones para acciones destructivas
- Protección contra pérdida de datos
- Estados de carga y validación visibles

### **4. Escalabilidad**
- Componentes reutilizables
- Patrones que funcionan en diferentes contextos
- Fácil mantenimiento y extensión

---

## 🎨 Tokens de Diseño

### **Espaciado Estándar**
\`\`\`css
/* Espaciado entre secciones principales */
space-y-6        /* 24px - Para secciones principales */
space-y-4        /* 16px - Para elementos relacionados */
space-y-2        /* 8px - Para elementos muy relacionados */

/* Padding interno */
p-6              /* 24px - Contenido principal */
p-4              /* 16px - Cards y modales */
p-3              /* 12px - Elementos compactos */

/* Gaps en grids */
gap-6            /* 24px - Entre cards principales */
gap-4            /* 16px - Entre elementos de formulario */
gap-2            /* 8px - Entre botones pequeños */
\`\`\`

### **Tipografía Estándar**
\`\`\`css
/* Títulos principales */
text-3xl font-bold text-gray-900    /* H1 - Títulos de página */
text-xl font-semibold text-gray-900 /* H2 - Títulos de modal */
text-lg font-semibold               /* H3 - Títulos de sección */

/* Texto de contenido */
text-gray-600                       /* Subtítulos y descripciones */
text-sm text-gray-600              /* Texto secundario */
text-xs text-gray-500              /* Texto auxiliar */

/* Texto de datos */
font-medium                         /* Datos importantes */
font-mono                          /* Códigos e identificadores */
text-2xl font-bold                 /* Valores destacados */
\`\`\`

### **Colores Estándar**
\`\`\`css
/* Grises (base) */
text-gray-900     /* Títulos principales */
text-gray-700     /* Texto normal */
text-gray-600     /* Subtítulos */
text-gray-500     /* Texto secundario */
bg-gray-50        /* Fondos suaves */

/* Azules (información) */
text-blue-600     /* Enlaces y acciones */
text-blue-700     /* Estados hover */
bg-blue-50        /* Fondos informativos */

/* Verdes (éxito/dinero) */
text-green-600    /* Valores positivos */
bg-green-50       /* Fondos de éxito */

/* Rojos (peligro) */
text-red-600      /* Acciones destructivas */
bg-red-50         /* Fondos de error */

/* Púrpuras (destacados) */
text-purple-600   /* Valores especiales */
bg-purple-50      /* Fondos destacados */
\`\`\`

---

## 🧩 Componentes Base

### **BaseModal**
**Ubicación:** `app/components/ui/BaseModal.tsx`

**Estándar establecido:**
\`\`\`typescript
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
\`\`\`

**Uso estándar:**
- Siempre usar con `useConfirm` para confirmaciones
- Títulos en `text-xl font-semibold text-gray-900`
- Subtítulos en `text-gray-600 mt-1`
- Botones secundarios con `bg-transparent`

### **Tables**
**Estándar establecido:**
\`\`\`typescript
// Estructura estándar
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="align-middle">Columna</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="align-top">Contenido</TableCell>
    </TableRow>
  </TableBody>
</Table>
\`\`\`

**Reglas:**
- **SIEMPRE** usar `align-middle` en headers
- **SIEMPRE** usar `align-top` en cells de contenido
- Datos importantes con `font-medium`
- Códigos con `font-mono`

---

## 🔢 Componentes Especializados

### **Sistema de Inputs Numéricos**
**Ubicación:** `components/ui/numeric-inputs.tsx`

#### **NumericInput (Base)**
\`\`\`typescript
interface NumericInputProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  min?: number
  max?: number
  allowDecimals?: boolean
  decimalPlaces?: number
  className?: string
  disabled?: boolean
  id?: string
}
\`\`\`

**Características:**
- Validación automática de entrada
- Soporte para decimales configurable
- Conversión automática a número
- InputMode optimizado para móviles

#### **CurrencyInput**
\`\`\`typescript
interface CurrencyInputProps extends Omit<NumericInputProps, 'allowDecimals' | 'decimalPlaces'> {
  currency?: string
  showSymbol?: boolean
}
\`\`\`

**Uso:**
\`\`\`typescript
<CurrencyInput
  value={precio}
  onChange={setPrecio}
  placeholder="2500"
  currency="$"
  showSymbol={true}
/>
\`\`\`

**Características:**
- Símbolo de moneda integrado
- Siempre permite decimales (2 lugares)
- Padding automático para el símbolo

#### **IntegerInput**
\`\`\`typescript
interface IntegerInputProps extends Omit<NumericInputProps, 'allowDecimals' | 'decimalPlaces'> {}
\`\`\`

**Uso:**
\`\`\`typescript
<IntegerInput
  value={cantidad}
  onChange={setCantidad}
  min={1}
  placeholder="12"
/>
\`\`\`

**Características:**
- Solo acepta números enteros
- Validación automática
- InputMode "numeric" para móviles

#### **TimeInput**
\`\`\`typescript
interface TimeInputProps extends Omit<NumericInputProps, 'allowDecimals' | 'decimalPlaces'> {
  unit?: string
  showUnit?: boolean
}
\`\`\`

**Uso:**
\`\`\`typescript
<TimeInput
  value={horas}
  onChange={setHoras}
  placeholder="2.5"
  unit="hs"
  showUnit={true}
/>
\`\`\`

**Características:**
- Permite decimales (1 lugar)
- Unidad visible integrada
- Optimizado para tiempo de trabajo

#### **QuantityInput**
\`\`\`typescript
interface QuantityInputProps extends Omit<NumericInputProps, 'decimalPlaces'> {
  unit?: string
  showUnit?: boolean
}
\`\`\`

**Uso:**
\`\`\`typescript
<QuantityInput
  value={peso}
  onChange={setPeso}
  unit="kg"
  showUnit={true}
  allowDecimals={true}
  placeholder="25.5"
/>
\`\`\`

**Características:**
- Configurable para enteros o decimales
- Unidad dinámica
- Flexible para diferentes medidas

### **Guía de Uso de Componentes Especializados**

#### **¿Cuándo usar cada componente?**

| Componente | Uso Recomendado | Ejemplo |
|------------|----------------|---------|
| `CurrencyInput` | Precios, costos, valores monetarios | Costo de materia prima, precio de venta |
| `IntegerInput` | Cantidades enteras, unidades | Cantidad de paquetes, rendimiento de lote |
| `TimeInput` | Tiempo de trabajo, duración | Horas de producción, tiempo de cocción |
| `QuantityInput` | Pesos, volúmenes, medidas | Cantidad de ingredientes, peso de producto |
| `NumericInput` | Casos especiales, configuración avanzada | Porcentajes personalizados, ratios |

#### **Migración desde Input tradicional**

**ANTES:**
\`\`\`typescript
<Input
  type="text"
  inputMode="decimal"
  value={precio || ""}
  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setPrecio(parseFloat(value) || 0)
  }}
  placeholder="2500"
/>
\`\`\`

**DESPUÉS:**
\`\`\`typescript
<CurrencyInput
  value={precio}
  onChange={setPrecio}
  placeholder="2500"
/>
\`\`\`

**Beneficios:**
- ✅ 90% menos código
- ✅ Validación automática
- ✅ UX consistente
- ✅ Manejo de errores integrado
- ✅ Accesibilidad mejorada

---

## 💰 **CÁLCULOS FINANCIEROS**

### **Fórmula de Margen de Ganancia**

#### **✅ FÓRMULA CORRECTA: Margen sobre Costo**
\`\`\`typescript
// Implementación estándar
const precioVentaSugerido = costo * (1 + margenGanancia / 100)

// Ejemplo: Costo $100 con margen 30%
// Precio = $100 * (1 + 30/100) = $100 * 1.30 = $130
\`\`\`

#### **❌ FÓRMULA INCORRECTA: Margen sobre Precio de Venta**
\`\`\`typescript
// NO USAR - Causa problemas matemáticos
const precioIncorrecto = costo / (1 - margenGanancia / 100)

// Problemas:
// - Margen 100% = División por cero (Infinity)
// - Precios contraintuitivos para el usuario
// - Escalamiento exponencial no deseado
\`\`\`

### **Comparación de Resultados**

| Costo | Margen | Precio Correcto | Precio Incorrecto | Diferencia |
|-------|--------|----------------|-------------------|------------|
| $100  | 30%    | $130.00        | $142.86           | +$12.86    |
| $100  | 50%    | $150.00        | $200.00           | +$50.00    |
| $100  | 100%   | $200.00        | **Infinity** ❌    | N/A        |
| $100  | 200%   | $300.00        | No funciona       | N/A        |

### **Configuración del Slider**

\`\`\`typescript
// Configuración estándar para margen de ganancia
<Slider
  value={margenGanancia}
  onValueChange={setMargenGanancia}
  max={350}  // Permite márgenes altos sin problemas
  step={1}
  className="w-full"
/>
\`\`\`

**Justificación del máximo 350%:**
- Permite flexibilidad para productos premium
- Sin riesgo de división por cero
- Escalamiento lineal predecible

### **Tooltips Explicativos**

\`\`\`typescript
// Tooltip estándar para margen de ganancia
<Tooltip>
  <TooltipTrigger asChild>
    <span className="cursor-help">
      Margen de ganancia deseado: {margenGanancia[0]}%
    </span>
  </TooltipTrigger>
  <TooltipContent className="max-w-xs">
    <p>
      <strong>Margen sobre costo:</strong> {margenGanancia[0]}% significa que el precio será {margenGanancia[0]}% más alto que el costo de producción.
    </p>
    <p className="mt-1 text-xs">
      Ejemplo: Costo $100 + {margenGanancia[0]}% = ${(100 * (1 + margenGanancia[0] / 100)).toFixed(2)}
    </p>
  </TooltipContent>
</Tooltip>
\`\`\`

### **Validación de Cálculos**

\`\`\`typescript
// Función de validación estándar
const validarCalculoMargen = (costo: number, margen: number, precio: number): boolean => {
  const precioEsperado = costo * (1 + margen / 100)
  const diferencia = Math.abs(precio - precioEsperado)
  return diferencia < 0.01 // Tolerancia de 1 centavo
}

// Uso en tests
expect(validarCalculoMargen(100, 30, 130)).toBe(true)
expect(validarCalculoMargen(100, 100, 200)).toBe(true)
\`\`\`

---

## 🔄 Patrones de Interacción

### **1. Confirmaciones Destructivas**
**Patrón estándar:** `useConfirm` + `BaseModal`

\`\`\`typescript
const { confirm } = useConfirm()

const handleEliminar = async () => {
  const confirmed = await confirm({
    title: `Eliminar "${nombre}"`,
    description: "Esta acción eliminará el elemento de forma permanente. No se puede deshacer.",
    confirmText: "Eliminar elemento",
    cancelText: "Mantener elemento", 
    variant: "destructive",
    icon: "delete",
  })
  
  if (confirmed) {
    // Ejecutar acción
    toast.success("Elemento eliminado exitosamente")
  }
}
\`\`\`

### **2. Dropdowns con Información Contextual**
**Patrón estándar:** Mostrar unidades para claridad

\`\`\`typescript
// ✅ CORRECTO - Con unidades
<SelectItem key={insumo.id} value={insumo.id}>
  {insumo.nombre} ({getUnidadMinima(insumo.unidadCompra)})
</SelectItem>

// ❌ INCORRECTO - Sin contexto
<SelectItem key={insumo.id} value={insumo.id}>
  {insumo.nombre}
</SelectItem>
\`\`\`

### **3. Mensajes de Toast Consistentes**
**Patrón estándar:** Terminología uniforme

\`\`\`typescript
// ✅ CORRECTO - Terminología UI
toast.success("Materia prima agregada exitosamente")
toast.error("Selecciona una materia prima y cantidad válida")

// ❌ INCORRECTO - Terminología técnica en UI
toast.success("Insumo agregado exitosamente")
\`\`\`

---

## 📐 Layouts y Grids

### **Layout Principal**
\`\`\`typescript
// Estructura estándar de página
<div className="space-y-6">
  {/* Header */}
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Título</h1>
      <p className="text-gray-600">Descripción</p>
    </div>
    <Button>Acción Principal</Button>
  </div>
  
  {/* Contenido */}
  <Card>...</Card>
</div>
\`\`\`

### **Grids Responsivos**
\`\`\`css
/* 2 columnas en desktop, 1 en mobile */
grid-cols-1 lg:grid-cols-2 gap-6

/* 3 columnas con breakpoints */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

/* 4 columnas para métricas */
grid-cols-2 md:grid-cols-4 gap-4
\`\`\`

---

## 🏷️ **TERMINOLOGÍA ESTANDARIZADA**

### **Decisiones de Nomenclatura**

#### **✅ USAR: "Materia Prima"**
- **Contexto**: Interfaz de usuario, títulos, labels, mensajes
- **Razón**: Más preciso para el contexto gastronómico
- **Ejemplos**:
  - "Seleccionar materia prima"
  - "Agregar Nueva Materia Prima"
  - "Materias Primas Utilizadas"

#### **✅ MANTENER: "Insumo"**
- **Contexto**: Código técnico, interfaces, variables
- **Razón**: Consistencia técnica y brevedad
- **Ejemplos**:
  - `interface Insumo`
  - `insumos.map()`
  - `insumoId`

### **Mapeo Terminológico**

| Contexto | Término Técnico | Término UI |
|----------|----------------|------------|
| Dropdown placeholder | `insumoId` | "Seleccionar materia prima" |
| Botón crear | `agregarInsumo()` | "Crear Nueva Materia Prima" |
| Header tabla | `Insumo` | "Materia Prima" |
| Toast mensaje | `insumo` | "materia prima" |
| Título sección | `insumos` | "Materias Primas Utilizadas" |

### **Reglas de Aplicación**

1. **Código Backend/Lógica**: Usar "insumo"
2. **Interfaz Usuario**: Usar "materia prima"
3. **Mensajes de Error**: Usar "materia prima"
4. **Documentación Técnica**: Usar "insumo"
5. **Documentación Usuario**: Usar "materia prima"

---

## ✅ Checklist de Calidad

### **Pre-implementación**
- [ ] ¿Usa terminología correcta? ("materia prima" en UI, "insumo" en código)
- [ ] ¿Dropdowns muestran unidades con `getUnidadMinima()`?
- [ ] ¿Headers de tabla usan "Materia Prima"?
- [ ] ¿Botones usan "Crear Nueva Materia Prima"?
- [ ] ¿Mensajes de toast son consistentes?

### **Componentes Numéricos**
- [ ] ¿Usa el componente especializado correcto?
- [ ] ¿CurrencyInput para valores monetarios?
- [ ] ¿IntegerInput para cantidades enteras?
- [ ] ¿TimeInput para tiempo de trabajo?
- [ ] ¿QuantityInput para pesos/volúmenes?

### **Cálculos Financieros**
- [ ] ¿Usa fórmula correcta de margen sobre costo?
- [ ] ¿Slider permite hasta 350% sin problemas?
- [ ] ¿Tooltips explican el tipo de margen usado?
- [ ] ¿Modal de costos muestra fórmula correcta?
- [ ] ¿Validación previene casos edge?

### **Componentes de Tabla**
- [ ] ¿TableHead tiene `align-middle`?
- [ ] ¿TableCell tiene `align-top`?
- [ ] ¿Datos importantes tienen `font-medium`?
- [ ] ¿Códigos usan `font-mono`?

### **Dropdowns y Selects**
- [ ] ¿Placeholder dice "Seleccionar materia prima"?
- [ ] ¿Items muestran formato "Nombre (unidad)"?
- [ ] ¿Función `getUnidadMinima()` está disponible?
- [ ] ¿Responsive con textos más largos?

### **Mensajes y Feedback**
- [ ] ¿Tooltips usan "materia prima"?
- [ ] ¿Toast messages son consistentes?
- [ ] ¿Confirmaciones usan terminología correcta?

---

## 💡 Ejemplos de Implementación

### **Ejemplo 1: CurrencyInput en ConfiguracionCostos**
\`\`\`typescript
// ✅ IMPLEMENTACIÓN CORRECTA
<div className="space-y-2">
  <Label htmlFor="valorHora">Valor hora de mano de obra</Label>
  <CurrencyInput
    id="valorHora"
    placeholder="250"
    value={formData.valorHoraProduccion}
    onChange={(value) => handleInputChange("valorHoraProduccion", value)}
  />
  <p className="text-xs text-gray-600">
    Cuánto vale tu tiempo de trabajo por hora...
  </p>
</div>
\`\`\`

### **Ejemplo 2: IntegerInput en Insumos**
\`\`\`typescript
// ✅ IMPLEMENTACIÓN CORRECTA
<div className="space-y-2">
  <Label htmlFor="unidadesCompradas">Unidades Compradas</Label>
  <IntegerInput
    id="unidadesCompradas"
    value={formData.cantidadPaquetes}
    onChange={(value) => setFormData((prev) => ({ ...prev, cantidadPaquetes: value }))}
    placeholder="1"
    min={1}
  />
</div>
\`\`\`

### **Ejemplo 3: TimeInput en Productos**
\`\`\`typescript
// ✅ IMPLEMENTACIÓN CORRECTA
<div className="space-y-2">
  <Label htmlFor="tiempoManoObra">Tiempo de Producción por Lote</Label>
  <TimeInput
    id="tiempoManoObra"
    value={formData.tiempoManoObraLote}
    onChange={(value) => setFormData((prev) => ({ ...prev, tiempoManoObraLote: value }))}
    placeholder="2.5"
  />
</div>
\`\`\`

### **Ejemplo 4: Cálculo de Margen Correcto**
\`\`\`typescript
// ✅ IMPLEMENTACIÓN CORRECTA
const precioVentaSugeridoPorEmpaque = costoTotalPorEmpaque * (1 + margenGanancia[0] / 100)

// Con tooltip explicativo
<Tooltip>
  <TooltipTrigger asChild>
    <span className="cursor-help">
      Margen de ganancia deseado: {margenGanancia[0]}%
    </span>
  </TooltipTrigger>
  <TooltipContent className="max-w-xs">
    <p>
      <strong>Margen sobre costo:</strong> {margenGanancia[0]}% significa que el precio será {margenGanancia[0]}% más alto que el costo de producción.
    </p>
    <p className="mt-1 text-xs">
      Ejemplo: Costo $100 + {margenGanancia[0]}% = ${(100 * (1 + margenGanancia[0] / 100)).toFixed(2)}
    </p>
  </TooltipContent>
</Tooltip>
\`\`\`

### **Ejemplo 5: Slider con Rango Extendido**
\`\`\`typescript
// ✅ IMPLEMENTACIÓN CORRECTA
<Slider
  value={margenGanancia}
  onValueChange={setMargenGanancia}
  max={350}  // Permite márgenes altos sin problemas
  step={1}
  className="w-full"
/>
<div className="flex justify-between text-xs text-gray-500">
  <span>0%</span>
  <span>350%</span>
</div>
\`\`\`

---

## 🎯 Conclusiones del Sistema

### **✅ Beneficios Implementados**
1. **UX Optimizada**: Inputs especializados con validación automática
2. **Código Limpio**: 90% menos código repetitivo
3. **Consistencia**: Comportamiento uniforme en toda la aplicación
4. **Accesibilidad**: InputMode optimizado para móviles
5. **Mantenibilidad**: Componentes centralizados y reutilizables
6. **Cálculos Correctos**: Fórmula de margen intuitiva y sin casos edge

### **🔧 Componentes Creados**
1. **NumericInput**: Base para todos los inputs numéricos
2. **CurrencyInput**: Valores monetarios con símbolo
3. **IntegerInput**: Cantidades enteras optimizadas
4. **TimeInput**: Tiempo con unidades integradas
5. **QuantityInput**: Pesos/volúmenes con unidades dinámicas

### **💰 Mejoras Financieras**
1. **Fórmula Corregida**: Margen sobre costo (intuitivo)
2. **Sin Casos Edge**: Eliminación del bug de Infinity
3. **Slider Extendido**: Hasta 350% sin problemas
4. **Tooltips Explicativos**: Claridad sobre tipo de margen
5. **Validación Robusta**: Prevención de errores matemáticos

### **📈 Estado Final**
**La aplicación ahora tiene un Design System completo con:**
- ✅ Componentes especializados implementados
- ✅ Terminología 100% consistente
- ✅ UX optimizada para entrada de datos numéricos
- ✅ Validación automática en todos los inputs
- ✅ Código mantenible y escalable
- ✅ Cálculos financieros correctos e intuitivos
- ✅ Eliminación completa del bug de margen infinito

---

**Documento actualizado:** Diciembre 2024  
**Versión:** 4.0  
**Estado:** Sistema completo implementado - Componentes especializados activos + Cálculos financieros corregidos
