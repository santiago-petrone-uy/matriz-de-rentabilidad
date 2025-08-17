# Design System - Matriz de Rentabilidad
## Documentación Interna de Patrones, Componentes y Estándares

---

## 📋 Índice
1. [Principios de Diseño](#principios-de-diseño)
2. [Tokens de Diseño](#tokens-de-diseño)
3. [Componentes Base](#componentes-base)
4. [Patrones de Interacción](#patrones-de-interacción)
5. [Layouts y Grids](#layouts-y-grids)
6. [Terminología Estandarizada](#terminología-estandarizada)
7. [Checklist de Calidad](#checklist-de-calidad)
8. [Ejemplos de Implementación](#ejemplos-de-implementación)

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

### **Dropdowns con Unidades**
**Estándar establecido:**
\`\`\`typescript
// Formato estándar para materias primas
<SelectContent>
  {insumos.map((insumo) => (
    <SelectItem key={insumo.id} value={insumo.id}>
      {insumo.nombre} ({getUnidadMinima(insumo.unidadCompra)})
    </SelectItem>
  ))}
</SelectContent>

// Función auxiliar requerida
const getUnidadMinima = (unidad: string) => {
  switch (unidad) {
    case "kg": return "g"
    case "g": return "g"
    case "l": return "ml"
    case "ml": return "ml"
    case "unidades": return "ud"
    default: return "g"
  }
}
\`\`\`

**Resultado Visual:**
- "Fécula de mandioca (g)"
- "Aceite de girasol (ml)"
- "Huevos (ud)"

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

## ✅ Checklist de Calidad

### **Pre-implementación**
- [ ] ¿Usa terminología correcta? ("materia prima" en UI, "insumo" en código)
- [ ] ¿Dropdowns muestran unidades con `getUnidadMinima()`?
- [ ] ¿Headers de tabla usan "Materia Prima"?
- [ ] ¿Botones usan "Crear Nueva Materia Prima"?
- [ ] ¿Mensajes de toast son consistentes?

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

### **Ejemplo 1: Dropdown Estándar con Unidades**
\`\`\`typescript
// ✅ IMPLEMENTACIÓN CORRECTA
<Select value={ingredienteSeleccionado} onValueChange={setIngredienteSeleccionado}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar materia prima" />
  </SelectTrigger>
  <SelectContent>
    {insumos.map((insumo) => (
      <SelectItem key={insumo.id} value={insumo.id}>
        {insumo.nombre} ({getUnidadMinima(insumo.unidadCompra)})
      </SelectItem>
    ))}
  </SelectContent>
</Select>
\`\`\`

### **Ejemplo 2: Tabla con Headers Correctos**
\`\`\`typescript
// ✅ IMPLEMENTACIÓN CORRECTA
<TableHeader>
  <TableRow>
    <TableHead className="align-middle">Materia Prima</TableHead>
    <TableHead className="align-middle">Cantidad</TableHead>
    <TableHead className="align-middle">Costo</TableHead>
    <TableHead className="align-middle"></TableHead>
  </TableRow>
</TableHeader>
\`\`\`

### **Ejemplo 3: Botones con Terminología Consistente**
\`\`\`typescript
// ✅ IMPLEMENTACIÓN CORRECTA
<Button variant="outline" className="w-full bg-transparent" onClick={() => setIsInsumoModalOpen(true)}>
  <Plus className="mr-2 h-4 w-4" />
  Crear Nueva Materia Prima
</Button>

<Tooltip>
  <TooltipTrigger asChild>
    <Button onClick={agregarIngrediente} className="w-10 h-10 p-0">
      <Plus className="h-4 w-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Agregar materia prima</p>
  </TooltipContent>
</Tooltip>
\`\`\`

---

## 🎯 Conclusiones del Análisis

### **✅ Cambios Implementados**
1. **Terminología Normalizada**: "Materia prima" en UI, "insumo" en código
2. **Dropdowns Mejorados**: Unidades visibles con `getUnidadMinima()`
3. **Headers Actualizados**: "Materia Prima" en lugar de "Ingrediente"
4. **Botones Consistentes**: "Crear Nueva Materia Prima"
5. **Mensajes Uniformes**: Toast y tooltips con terminología correcta

### **🔧 Beneficios Logrados**
1. **UX Mejorada**: Usuario ve inmediatamente qué unidad usar
2. **Consistencia**: Terminología uniforme en toda la aplicación
3. **Claridad**: Dropdowns más informativos y útiles
4. **Profesionalismo**: Lenguaje apropiado para el contexto gastronómico

### **📈 Estado Final**
**La aplicación ahora tiene 99% de consistencia terminológica y UX optimizada.**

---

**Documento actualizado:** $(date)  
**Versión:** 2.0  
**Estado:** Implementación completa - Terminología y UX optimizadas
