# Pantalla de Gestión de Clientes - María Bags

## Resumen

Se ha creado una pantalla completa de gestión de clientes siguiendo Atomic Design, con animaciones vibrantes, diseño mobile-first y optimización táctil.

## Archivos Creados

### 1. Servicios (`frontend/src/services/`)

- **`clienteService.ts`**: Servicio completo para llamadas a la API de clientes
  - getAllClientes()
  - getClienteById(id)
  - createCliente(data)
  - updateCliente(id, data)
  - deleteCliente(id) - Soft delete
  - searchClientes(term)
  - getWhatsAppLink(id, message?)

### 2. Hooks Personalizados (`frontend/src/hooks/`)

- **`useClientes.ts`**: Hook para gestión de estado de clientes
  - Auto-fetch al montar
  - Estados: clientes, loading, error
  - Funciones: fetchClientes, createCliente, deleteCliente, searchClientes
  - Manejo robusto de errores

- **`useWhatsApp.ts`**: Hook para generar links de WhatsApp
  - generateWhatsAppLink(clienteId, message)
  - openWhatsApp(phoneNumber, message)
  - Formato automático de números

- **`useToast.ts`**: Hook para notificaciones toast (opcional)
  - showToast(message, type, duration)
  - hideToast(id)
  - clearAllToasts()
  - Auto-dismiss configurable

### 3. Componentes Atoms (`frontend/src/components/atoms/`)

- **`Badge.tsx`**: Badge para estados (Activo/Inactivo)
  - Variantes: success, danger, warning, info, neutral
  - Tamaños: sm, md, lg
  - Animación pulse opcional

- **`SearchInput.tsx`**: Input especializado para búsqueda
  - Icono de búsqueda integrado
  - Botón de limpiar (X)
  - Debounce de 300ms
  - Auto-focus opcional

### 4. Componentes Molecules (`frontend/src/components/molecules/`)

- **`ClienteCard.tsx`**: Card para mostrar un cliente
  - Avatar con iniciales
  - Nombre, apellido, teléfono
  - Badge de estado (activo/inactivo)
  - Botón flotante de WhatsApp
  - Botón de eliminar
  - Animaciones hover/tap

- **`ClienteForm.tsx`**: Formulario para crear/editar cliente
  - 3 campos: Nombre, Apellido, Teléfono
  - Validación en tiempo real
  - Mensajes de error específicos
  - Auto-focus en primer campo
  - Botones: Cancelar, Crear/Actualizar

- **`SearchBar.tsx`**: Barra de búsqueda con acciones
  - SearchInput integrado
  - Contador de resultados
  - Botón "Agregar Cliente" (desktop)
  - Sticky opcional

- **`TabNavigation.tsx`**: Navegación inferior tipo tab bar
  - Mobile-first design
  - Animación de tab activo
  - Safe area bottom
  - Touch targets 44px

### 5. Componentes Organisms (`frontend/src/components/organisms/`)

- **`ClientesList.tsx`**: Lista de clientes con animaciones
  - Grid responsive (1 col móvil, 2-3 cols desktop)
  - Animación stagger (0.1s entre items)
  - Estados: loading, empty, error
  - Skeletons durante carga
  - AnimatePresence para add/remove

- **`ClienteFormModal.tsx`**: Modal para agregar/editar cliente
  - Overlay con backdrop blur
  - Card centrado con formulario
  - Botón de cerrar (X)
  - Click fuera para cerrar
  - ESC para cerrar
  - Previene scroll del body

### 6. Páginas (`frontend/src/pages/`)

- **`Clientes.tsx`**: Página principal de gestión
  - Header con logo y navegación
  - SearchBar en la parte superior
  - ClientesList con grid responsive
  - ClienteFormModal controlado
  - FAB flotante para móvil
  - Modal de confirmación de eliminación
  - Toast notifications integradas
  - Manejo completo de errores

### 7. Archivos Actualizados

- **`App.tsx`**: Ruta `/clientes` agregada con lazy loading
- **`Dashboard.tsx`**: Card de clientes ahora navega a `/clientes`
- **`Button.tsx`**: Soporte para children opcional y aria-label
- **`Input.tsx`**: Soporte para onBlur

## Características Principales

### Mobile-First Design
- Touch targets mínimo 44px en todos los botones
- Grid responsive: 1 col (móvil), 2 cols (tablet), 3 cols (desktop)
- FAB flotante para agregar cliente en móvil
- Navegación optimizada para pulgar

### Animaciones (Framer Motion)
- Lista de clientes: stagger children (0.1s delay)
- Cards: fade + slide from bottom
- Modal: scale from center + fade
- WhatsApp button: bounce on hover
- Delete: fade + scale out
- Skeletons: pulse animation

### Paleta de Colores
- Primary: Rosa vibrante (#ec4899)
- WhatsApp: Verde (#25D366)
- Success: Verde (badges activos)
- Danger: Rojo (eliminar, inactivos)
- Neutral: Gris (textos secundarios)

### UX
- Confirmación antes de eliminar (modal)
- Toast notifications (éxito/error)
- Auto-refresh después de crear
- Search debounce 300ms
- Loading skeletons en vez de spinner central
- Empty state amigable con ilustración

### Validaciones
- **Nombre**: requerido, 2-100 caracteres
- **Apellido**: requerido, 2-100 caracteres
- **Teléfono**: requerido, formato internacional (+54...), 10-15 dígitos

### Accesibilidad
- Labels en todos los inputs
- ARIA labels en botones iconográficos
- Focus visible en todos los elementos interactivos
- Keyboard navigation (ESC para cerrar modales)

## Integración con Backend

### Endpoints Utilizados
```
GET    /api/clientes                    - Listar todos los clientes
POST   /api/clientes                    - Crear nuevo cliente
GET    /api/clientes/:id                - Obtener cliente por ID
GET    /api/clientes/:id/whatsapp       - Generar link de WhatsApp
DELETE /api/clientes/:id                - Desactivar cliente (soft delete)
GET    /api/clientes/search?q=termino   - Buscar clientes
```

### Manejo de Errores
- Todos los servicios capturan y propagan errores
- Mensajes de error amigables al usuario
- Toast notifications para feedback visual
- Estados de error específicos en componentes

## Cómo Usar

### Navegación
1. Desde el Dashboard, click en el card "Clientes"
2. O navegar directamente a `/clientes`

### Crear Cliente
1. Click en "Agregar Cliente" (desktop) o FAB "+" (móvil)
2. Completar formulario con validación en tiempo real
3. Click en "Crear Cliente"
4. Toast de éxito y auto-refresh de la lista

### Buscar Cliente
1. Escribir en la barra de búsqueda
2. Búsqueda con debounce de 300ms
3. Resultados filtrados en tiempo real
4. Contador de resultados

### WhatsApp
1. Click en botón verde de WhatsApp en el card
2. Se abre WhatsApp Web/App con mensaje pre-cargado
3. Número formateado automáticamente

### Desactivar Cliente
1. Click en botón rojo de eliminar
2. Modal de confirmación
3. Confirmación desactiva el cliente (soft delete)
4. Cliente aparece como "Inactivo" con opacidad reducida

## Estructura Atomic Design

```
ATOMS (Bloques básicos)
  - Badge
  - SearchInput
  - Button (actualizado)
  - Input (actualizado)

MOLECULES (Combinaciones simples)
  - ClienteCard
  - ClienteForm
  - SearchBar
  - TabNavigation

ORGANISMS (Componentes complejos)
  - ClientesList
  - ClienteFormModal

PAGES (Pantallas completas)
  - Clientes
```

## Performance

### Optimizaciones Implementadas
- Lazy loading de la página Clientes
- React.memo en componentes pesados (si es necesario)
- Debounce en búsqueda (300ms)
- Animaciones optimizadas (transform/opacity)
- Suspense con fallback loader

### Bundle Size
- Página Clientes: ~27KB (gzipped: 8KB)
- Assets totales: ~340KB (gzipped: 111KB)

## Próximos Pasos

### Mejoras Sugeridas
1. Agregar paginación o infinite scroll
2. Filtros avanzados (activo/inactivo, fecha)
3. Ordenamiento de columnas
4. Exportar a CSV/Excel
5. Vista de detalles del cliente (modal)
6. Historial de movimientos en card hover
7. Edición inline de clientes
8. Bulk operations (selección múltiple)

### Integraciones Futuras
- Sección de Movimientos (deudas/pagos)
- Dashboard con estadísticas
- Notificaciones push
- Sincronización offline

## Testing

### Casos de Prueba Sugeridos
- [ ] Crear cliente con datos válidos
- [ ] Validación de campos vacíos
- [ ] Validación de formato de teléfono
- [ ] Búsqueda de clientes
- [ ] Desactivar cliente
- [ ] Abrir WhatsApp
- [ ] Responsive en móvil, tablet, desktop
- [ ] Animaciones smooth
- [ ] Touch targets en móvil
- [ ] Accesibilidad (keyboard navigation)
- [ ] Loading states
- [ ] Error handling

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

## Notas Técnicas

- TypeScript estricto habilitado
- Tailwind CSS con config personalizada
- Framer Motion para animaciones
- React Router v6 para routing
- Axios para HTTP requests
- LocalStorage para JWT token

## Autor

Desarrollado por Claude Code siguiendo las especificaciones de María Bags y principios de Atomic Design.

---

**Última actualización**: 2026-02-04
**Versión**: 1.0.0
