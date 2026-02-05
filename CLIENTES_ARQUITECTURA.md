# Arquitectura de la Feature Clientes

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PÁGINA CLIENTES                              │
│  /pages/Clientes.tsx                                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Estado Local:                                                 │   │
│  │  - searchTerm                                                 │   │
│  │  - isModalOpen                                                │   │
│  │  - isSubmitting                                               │   │
│  │  - deleteConfirm                                              │   │
│  │  - toast                                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Hooks Personalizados:                                         │   │
│  │  - useClientes() → estado de clientes, CRUD operations       │   │
│  │  - useWhatsApp() → generación de links WhatsApp              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
      ┌────────────────────────────────────────────┐
      │         CUSTOM HOOKS                       │
      │  /hooks/useClientes.ts                     │
      │  /hooks/useWhatsApp.ts                     │
      │                                            │
      │  Maneja:                                   │
      │  - Estado global de clientes               │
      │  - Loading states                          │
      │  - Error handling                          │
      │  - Auto-fetch                              │
      └─────────────────┬──────────────────────────┘
                        │
                        ▼
      ┌────────────────────────────────────────────┐
      │         SERVICIOS                          │
      │  /services/clienteService.ts               │
      │                                            │
      │  Funciones:                                │
      │  - getAllClientes()                        │
      │  - getClienteById(id)                      │
      │  - createCliente(data)                     │
      │  - updateCliente(id, data)                 │
      │  - deleteCliente(id)                       │
      │  - searchClientes(term)                    │
      │  - getWhatsAppLink(id, message)            │
      └─────────────────┬──────────────────────────┘
                        │
                        ▼
      ┌────────────────────────────────────────────┐
      │         API CLIENT                         │
      │  /services/api.ts                          │
      │                                            │
      │  Axios instance con:                       │
      │  - JWT interceptor                         │
      │  - Error handling                          │
      │  - Base URL configuration                  │
      └─────────────────┬──────────────────────────┘
                        │
                        ▼
      ┌────────────────────────────────────────────┐
      │         BACKEND API                        │
      │  http://localhost:3000/api                 │
      │                                            │
      │  Endpoints:                                │
      │  GET    /clientes                          │
      │  POST   /clientes                          │
      │  GET    /clientes/:id                      │
      │  PUT    /clientes/:id                      │
      │  DELETE /clientes/:id                      │
      │  GET    /clientes/search?q=term            │
      │  GET    /clientes/:id/whatsapp             │
      └────────────────────────────────────────────┘
```

## Jerarquía de Componentes

```
Clientes (Page)
├── Header
│   ├── Button (Volver)
│   ├── Logo
│   └── Title
│
├── SearchBar (Molecule)
│   ├── SearchInput (Atom)
│   └── Button (Agregar Cliente - Desktop)
│
├── ClientesList (Organism)
│   └── ClienteCard[] (Molecule)
│       ├── Avatar (div con iniciales)
│       ├── Nombre y apellido
│       ├── Teléfono formateado
│       ├── Badge (Atom) - Estado
│       ├── Button (WhatsApp)
│       └── Button (Eliminar)
│
├── FAB Button (Agregar - Móvil)
│
├── ClienteFormModal (Organism)
│   ├── Overlay (backdrop)
│   └── Card
│       ├── Header con botón cerrar
│       └── ClienteForm (Molecule)
│           ├── Input (Nombre)
│           ├── Input (Apellido)
│           ├── Input (Teléfono)
│           └── Buttons (Cancelar, Crear)
│
├── DeleteConfirmModal
│   ├── Overlay
│   └── Card
│       ├── Título
│       ├── Mensaje de confirmación
│       └── Buttons (Cancelar, Desactivar)
│
└── Toast Notification
    └── Mensaje de éxito/error
```

## Atomic Design - Detalle

```
┌─────────────────────────────────────────────────────────────────┐
│ ATOMS - Bloques Básicos Reutilizables                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Badge                  SearchInput              Button         │
│  ┌────────┐           ┌──────────┐            ┌─────────┐     │
│  │ Activo │           │ 🔍 [____]│            │ Crear   │     │
│  └────────┘           └──────────┘            └─────────┘     │
│                                                                 │
│  Input                  Logo                   Spinner         │
│  ┌──────────┐         ┌────────┐             ┌────────┐      │
│  │ [____]   │         │ María  │             │   ⟳    │      │
│  └──────────┘         │  Bags  │             └────────┘      │
│                       └────────┘                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MOLECULES - Combinaciones Simples                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ClienteCard                                                    │
│  ┌─────────────────────────────────────────────┐              │
│  │ ┌──┐  María González                    [X] │              │
│  │ │MG│  +54 911 1234-5678                     │              │
│  │ └──┘  [Activo]                         [WA] │              │
│  │ Cliente desde 15/01/2024                    │              │
│  └─────────────────────────────────────────────┘              │
│                                                                 │
│  ClienteForm                                                    │
│  ┌─────────────────────────────────────────────┐              │
│  │ Nombre:    [________]                       │              │
│  │ Apellido:  [________]                       │              │
│  │ Teléfono:  [________]                       │              │
│  │ [Cancelar]          [Crear Cliente]         │              │
│  └─────────────────────────────────────────────┘              │
│                                                                 │
│  SearchBar                                                      │
│  ┌─────────────────────────────────────────────┐              │
│  │ 🔍 [Buscar cliente...]  [+ Agregar Cliente] │              │
│  │ 5 clientes encontrados                       │              │
│  └─────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ORGANISMS - Componentes Complejos                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ClientesList                                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │ │ Card 1   │  │ Card 2   │  │ Card 3   │              │  │
│  │ └──────────┘  └──────────┘  └──────────┘              │  │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │ │ Card 4   │  │ Card 5   │  │ Card 6   │              │  │
│  │ └──────────┘  └──────────┘  └──────────┘              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ClienteFormModal                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ [Overlay blur]                                          │  │
│  │                                                         │  │
│  │       ┌───────────────────────────────┐                │  │
│  │       │ Agregar Cliente          [X]  │                │  │
│  │       ├───────────────────────────────┤                │  │
│  │       │ [ClienteForm Component]       │                │  │
│  │       │                               │                │  │
│  │       └───────────────────────────────┘                │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PAGE - Pantalla Completa                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Clientes                                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ [← Logo] Clientes                                       │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ [SearchBar Component]                                   │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ [ClientesList Component]                                │  │
│  │                                                         │  │
│  │                                              [FAB +]    │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Estados de la UI

### Estado: Loading
```
┌────────────────────────────────────┐
│ [SearchBar]                        │
│ ┌─────┐  ┌─────┐  ┌─────┐         │
│ │ 💀  │  │ 💀  │  │ 💀  │  Skeleton│
│ └─────┘  └─────┘  └─────┘         │
│ ┌─────┐  ┌─────┐  ┌─────┐         │
│ │ 💀  │  │ 💀  │  │ 💀  │         │
│ └─────┘  └─────┘  └─────┘         │
└────────────────────────────────────┘
```

### Estado: Empty
```
┌────────────────────────────────────┐
│ [SearchBar - 0 clientes]           │
│                                    │
│         ┌────────┐                 │
│         │   👤   │                 │
│         └────────┘                 │
│     No hay clientes                │
│   Comienza agregando tu            │
│   primer cliente...                │
└────────────────────────────────────┘
```

### Estado: Error
```
┌────────────────────────────────────┐
│ [SearchBar]                        │
│                                    │
│         ┌────────┐                 │
│         │   ⚠️   │                 │
│         └────────┘                 │
│  Error al cargar clientes          │
│  [Mensaje de error]                │
└────────────────────────────────────┘
```

### Estado: Success
```
┌────────────────────────────────────┐
│ [SearchBar - 5 clientes]           │
│ ┌──────┐  ┌──────┐  ┌──────┐      │
│ │ MG   │  │ JL   │  │ AP   │      │
│ │María │  │Juan  │  │Ana   │      │
│ │[✓]WA │  │[✓]WA │  │[✓]WA │      │
│ └──────┘  └──────┘  └──────┘      │
└────────────────────────────────────┘
```

## Animaciones (Framer Motion)

### Timeline de Animaciones

```
Carga de Página:
0ms    ─────►  Header aparece (y: -50 → 0)
100ms  ─────►  SearchBar aparece (y: -20 → 0)
200ms  ─────►  Card 1 aparece (y: 20 → 0, opacity: 0 → 1)
300ms  ─────►  Card 2 aparece (stagger +100ms)
400ms  ─────►  Card 3 aparece (stagger +100ms)
500ms  ─────►  FAB aparece (scale: 0 → 1)
```

### Interacciones

```
Hover en Card:
  - y: 0 → -4px
  - shadow: aumenta
  - border: transparent → primary-200
  - duration: 200ms

Tap en Botón:
  - scale: 1 → 0.98
  - duration: 100ms

WhatsApp Button Hover:
  - scale: 1 → 1.1
  - bounce effect

Modal Open:
  - Overlay: opacity 0 → 1
  - Card: scale 0.9 → 1, y: 20 → 0
  - spring animation (damping: 25)

Delete Card:
  - opacity: 1 → 0
  - scale: 1 → 0.8
  - duration: 200ms
```

## Responsive Breakpoints

```
Mobile (< 640px)
┌──────────┐
│  Card 1  │  1 columna
│  Card 2  │  FAB visible
│  Card 3  │  SearchBar full width
└──────────┘

Tablet (640px - 1024px)
┌─────────┬─────────┐
│ Card 1  │ Card 2  │  2 columnas
│ Card 3  │ Card 4  │  Botón "Agregar" visible
└─────────┴─────────┘

Desktop (> 1024px)
┌──────┬──────┬──────┐
│Card 1│Card 2│Card 3│  3 columnas
│Card 4│Card 5│Card 6│  Layout optimizado
└──────┴──────┴──────┘
```

## Touch Targets

```
Todos los elementos interactivos cumplen con:
┌────────────────────────────┐
│   Min: 44px × 44px         │
│   Recomendado: 48px × 48px │
│   Óptimo: 52px × 52px      │
└────────────────────────────┘

Ejemplos:
- Botones: min-h-touch (44px)
- FAB: 56px × 56px (14 × 14 = 56)
- WhatsApp button: 44px × 44px (11 × 11 = 44)
- Search clear button: 44px × 44px
- Delete button: 44px × 44px
```

## Performance Metrics

```
Métricas Objetivo:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

Bundle Size:
- Clientes.js: 27KB (gzip: 8KB)
- Total App: 340KB (gzip: 111KB)

Optimizaciones:
- Lazy loading de rutas
- Code splitting automático
- Debounce en búsqueda (300ms)
- Animaciones GPU-accelerated
- Skeleton loaders (mejor UX)
```

## Flujo de Usuario

```
FLUJO: Crear Nuevo Cliente

1. Usuario → Click "Agregar Cliente" o FAB
2. Sistema → Abrir ClienteFormModal
              Animación: scale + fade
3. Usuario → Llenar formulario
              Validación en tiempo real
4. Usuario → Click "Crear Cliente"
5. Sistema → Loading state (isSubmitting)
6. Sistema → POST /api/clientes
7. Backend → Validar y crear cliente
8. Backend → Retornar cliente creado
9. Sistema → Actualizar lista (auto-refresh)
              Cerrar modal
              Mostrar toast de éxito
10. Usuario → Ve nuevo cliente en lista
               Animación: fade + slide

FLUJO: Buscar Cliente

1. Usuario → Escribe en SearchInput
2. Sistema → Debounce 300ms
3. Sistema → GET /api/clientes/search?q=term
4. Backend → Filtrar clientes
5. Sistema → Actualizar lista con resultados
              Mostrar contador
6. Usuario → Ve resultados filtrados

FLUJO: WhatsApp

1. Usuario → Click botón WhatsApp en card
2. Sistema → GET /api/clientes/:id/whatsapp
3. Backend → Generar link con número formateado
4. Sistema → Abrir WhatsApp Web/App
              window.open() en nueva pestaña
5. Usuario → Chatea con el cliente

FLUJO: Desactivar Cliente

1. Usuario → Click botón eliminar en card
2. Sistema → Mostrar modal de confirmación
3. Usuario → Confirmar desactivación
4. Sistema → DELETE /api/clientes/:id
5. Backend → Soft delete (activo = false)
6. Sistema → Actualizar estado local
              Cerrar modal
              Mostrar toast de éxito
7. Usuario → Ve cliente marcado como "Inactivo"
               Opacidad reducida, sin botones
```

---

**Última actualización**: 2026-02-04
**Versión**: 1.0.0
