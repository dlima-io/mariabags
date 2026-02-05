# Checklist de Verificación - Feature Clientes

## Pre-Requisitos

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Base de datos PostgreSQL activa
- [ ] JWT token válido en localStorage
- [ ] Frontend corriendo en modo dev (`npm run dev`)

## Estructura de Archivos

### Servicios
- [x] `frontend/src/services/clienteService.ts` - Creado
- [x] Integración con `frontend/src/services/api.ts` - Verificado

### Hooks
- [x] `frontend/src/hooks/useClientes.ts` - Creado
- [x] `frontend/src/hooks/useWhatsApp.ts` - Creado
- [x] `frontend/src/hooks/useToast.ts` - Creado (opcional)

### Componentes Atoms
- [x] `frontend/src/components/atoms/Badge.tsx` - Creado
- [x] `frontend/src/components/atoms/SearchInput.tsx` - Creado
- [x] `frontend/src/components/atoms/Button.tsx` - Actualizado (children opcional)
- [x] `frontend/src/components/atoms/Input.tsx` - Actualizado (onBlur support)

### Componentes Molecules
- [x] `frontend/src/components/molecules/ClienteCard.tsx` - Creado
- [x] `frontend/src/components/molecules/ClienteForm.tsx` - Creado
- [x] `frontend/src/components/molecules/SearchBar.tsx` - Creado
- [x] `frontend/src/components/molecules/TabNavigation.tsx` - Creado

### Componentes Organisms
- [x] `frontend/src/components/organisms/ClientesList.tsx` - Creado
- [x] `frontend/src/components/organisms/ClienteFormModal.tsx` - Creado

### Páginas
- [x] `frontend/src/pages/Clientes.tsx` - Creado
- [x] `frontend/src/App.tsx` - Actualizado (ruta /clientes)
- [x] `frontend/src/pages/Dashboard.tsx` - Actualizado (navegación)

### Utilidades
- [x] `frontend/src/utils/formatters.ts` - Ya existía

### Tipos
- [x] `frontend/src/types/Cliente.types.ts` - Ya existía

## Compilación

- [x] `npm run build` exitoso
- [x] Sin errores de TypeScript
- [x] Sin warnings críticos
- [x] Bundle size razonable (<500KB)

## Funcionalidad

### Navegación
- [ ] Dashboard → Clientes (click en card)
- [ ] Ruta `/clientes` accesible directamente
- [ ] Botón "Volver" regresa al Dashboard
- [ ] Lazy loading funciona correctamente

### Listado de Clientes
- [ ] Clientes se cargan automáticamente al entrar
- [ ] Loading skeleton se muestra durante carga
- [ ] Clientes se muestran en grid responsive
- [ ] Grid adapta columnas según viewport
  - [ ] 1 columna en móvil (< 768px)
  - [ ] 2 columnas en tablet (768px - 1024px)
  - [ ] 3 columnas en desktop (> 1024px)

### Cliente Card
- [ ] Avatar muestra iniciales correctas
- [ ] Nombre y apellido se muestran completos
- [ ] Teléfono formateado correctamente (+54 XXX XXXX-XXXX)
- [ ] Badge "Activo" aparece en verde
- [ ] Badge "Inactivo" aparece en rojo (si hay clientes inactivos)
- [ ] Botón WhatsApp visible en clientes activos
- [ ] Botón eliminar visible en clientes activos
- [ ] Fecha de creación formateada (DD/MM/YYYY)
- [ ] Hover effect funciona (elevación + border)
- [ ] Click en card (placeholder para detalles)

### Búsqueda
- [ ] SearchBar visible en la parte superior
- [ ] Input de búsqueda funcional
- [ ] Debounce funciona (300ms)
- [ ] Botón "X" limpia búsqueda
- [ ] Contador de resultados actualiza
- [ ] Búsqueda filtra por nombre, apellido o teléfono
- [ ] "0 clientes" muestra mensaje apropiado
- [ ] Loading indicator durante búsqueda

### Crear Cliente
- [ ] Botón "Agregar Cliente" visible en desktop
- [ ] FAB "+" visible en móvil
- [ ] Click abre modal con formulario
- [ ] Modal centrado con overlay blur
- [ ] Formulario tiene 3 campos: Nombre, Apellido, Teléfono
- [ ] Auto-focus en campo Nombre
- [ ] Validación en tiempo real:
  - [ ] Nombre requerido (2-100 chars)
  - [ ] Apellido requerido (2-100 chars)
  - [ ] Teléfono formato internacional (+54...)
- [ ] Mensajes de error específicos
- [ ] Botón "Crear Cliente" tiene loading state
- [ ] Botón "Cancelar" cierra modal
- [ ] ESC cierra modal
- [ ] Click fuera del modal lo cierra
- [ ] Después de crear:
  - [ ] Modal se cierra
  - [ ] Toast de éxito aparece
  - [ ] Lista se actualiza automáticamente
  - [ ] Nuevo cliente aparece al inicio

### WhatsApp
- [ ] Click en botón verde abre WhatsApp
- [ ] Se abre en nueva pestaña
- [ ] Número formateado correctamente
- [ ] Mensaje pre-cargado (si el backend lo soporta)
- [ ] Funciona en móvil (app WhatsApp)
- [ ] Funciona en desktop (WhatsApp Web)

### Desactivar Cliente
- [ ] Click en botón rojo muestra confirmación
- [ ] Modal de confirmación muestra nombre del cliente
- [ ] Botón "Cancelar" cierra modal
- [ ] Botón "Desactivar" ejecuta soft delete
- [ ] Después de desactivar:
  - [ ] Modal se cierra
  - [ ] Toast de éxito aparece
  - [ ] Cliente aparece como "Inactivo"
  - [ ] Opacidad reducida en card
  - [ ] Botones WhatsApp y eliminar desaparecen

### Estados de Error
- [ ] Error de red muestra mensaje apropiado
- [ ] Error 401 redirige a login
- [ ] Error 500 muestra toast de error
- [ ] Error de validación muestra en formulario
- [ ] Toast de error se cierra automáticamente (3s)

### Estados Vacíos
- [ ] "No hay clientes" muestra ilustración
- [ ] Mensaje amigable con call-to-action
- [ ] Búsqueda sin resultados muestra mensaje apropiado

## Responsive Design

### Móvil (< 640px)
- [ ] Grid 1 columna
- [ ] FAB visible y funcional
- [ ] Botón "Agregar Cliente" oculto en SearchBar
- [ ] Touch targets mínimo 44px
- [ ] Texto legible sin zoom
- [ ] Cards no se cortan
- [ ] Modal ocupa 90% del viewport

### Tablet (640px - 1024px)
- [ ] Grid 2 columnas
- [ ] FAB oculto
- [ ] Botón "Agregar Cliente" visible
- [ ] Layout equilibrado
- [ ] Cards tienen buen espaciado

### Desktop (> 1024px)
- [ ] Grid 3 columnas
- [ ] Layout centrado con max-width
- [ ] Hover effects funcionan
- [ ] Animaciones smooth

## Animaciones

### Entrada de Página
- [ ] Header aparece desde arriba (-50px)
- [ ] SearchBar aparece con fade
- [ ] Cards aparecen con stagger (0.1s)
- [ ] FAB aparece con scale desde 0

### Interacciones
- [ ] Hover en card: elevación + border
- [ ] Tap en botón: scale 0.98
- [ ] WhatsApp hover: bounce
- [ ] Modal open: scale + fade
- [ ] Modal close: reverse animation
- [ ] Toast appear: slide + scale desde abajo
- [ ] Delete card: fade + scale out

### Performance
- [ ] Animaciones corren a 60fps
- [ ] No jank visible
- [ ] GPU acceleration activa (transform/opacity)
- [ ] No layout shifts durante animaciones

## Accesibilidad

### Keyboard Navigation
- [ ] Tab navega entre elementos
- [ ] Enter abre modal
- [ ] ESC cierra modal
- [ ] Enter en input busca
- [ ] Focus visible en todos los elementos

### ARIA
- [ ] Botones tienen aria-label apropiados
- [ ] Inputs tienen labels visibles
- [ ] Modal tiene role="dialog"
- [ ] Loading states anunciados

### Contraste
- [ ] Texto sobre fondo cumple WCAG AA (4.5:1)
- [ ] Botones tienen contraste suficiente
- [ ] Badges legibles

## Performance

### Carga Inicial
- [ ] Lazy loading funciona
- [ ] Suspense fallback se muestra
- [ ] < 3s hasta interactivo

### Búsqueda
- [ ] Debounce evita llamadas innecesarias
- [ ] Búsqueda responde rápido (< 500ms)

### Animaciones
- [ ] Smooth en todos los dispositivos
- [ ] No bloquea interacciones

### Bundle
- [ ] Clientes.js < 30KB gzipped
- [ ] Total app < 120KB gzipped

## Seguridad

### Validación
- [ ] Validación cliente-side funciona
- [ ] Validación servidor-side existe
- [ ] Teléfonos únicos (backend)
- [ ] Sanitización de inputs

### Autenticación
- [ ] JWT requerido para todas las llamadas
- [ ] Token expirado redirige a login
- [ ] Sin token redirige a login

## Errores Comunes

### Compilación
- [x] NodeJS.Timeout → number (SearchInput)
- [x] Imports no usados eliminados
- [x] onBlur agregado a Input
- [x] children opcional en Button
- [x] aria-label agregado donde corresponde

### Runtime
- [ ] Backend corriendo
- [ ] CORS configurado correctamente
- [ ] Base de datos accesible
- [ ] Variables de entorno configuradas

## Pruebas Manuales

### Flujo Completo 1: Crear Cliente
1. [ ] Entrar a /clientes
2. [ ] Click "Agregar Cliente"
3. [ ] Llenar: Nombre="Test", Apellido="Usuario", Teléfono="+5491112345678"
4. [ ] Click "Crear Cliente"
5. [ ] Verificar toast de éxito
6. [ ] Verificar cliente en lista
7. [ ] Verificar avatar con iniciales "TU"

### Flujo Completo 2: Buscar Cliente
1. [ ] Escribir "Test" en búsqueda
2. [ ] Esperar 300ms (debounce)
3. [ ] Verificar resultados filtrados
4. [ ] Click "X" para limpiar
5. [ ] Verificar que muestra todos los clientes

### Flujo Completo 3: WhatsApp
1. [ ] Click botón verde en cliente
2. [ ] Verificar apertura de WhatsApp
3. [ ] Verificar número correcto
4. [ ] Cerrar WhatsApp
5. [ ] Volver a la app

### Flujo Completo 4: Desactivar Cliente
1. [ ] Click botón rojo en cliente
2. [ ] Leer modal de confirmación
3. [ ] Click "Desactivar"
4. [ ] Verificar toast de éxito
5. [ ] Verificar badge "Inactivo"
6. [ ] Verificar que no tiene botones

### Flujo Completo 5: Responsive
1. [ ] Abrir DevTools
2. [ ] Cambiar a móvil (375px)
3. [ ] Verificar 1 columna
4. [ ] Verificar FAB visible
5. [ ] Cambiar a tablet (768px)
6. [ ] Verificar 2 columnas
7. [ ] Cambiar a desktop (1440px)
8. [ ] Verificar 3 columnas

## Testing Automatizado (Futuro)

### Unit Tests
- [ ] clienteService.getAllClientes()
- [ ] clienteService.createCliente()
- [ ] useClientes hook
- [ ] Validaciones de formulario
- [ ] Formatters (phone, date)

### Integration Tests
- [ ] Crear cliente end-to-end
- [ ] Búsqueda end-to-end
- [ ] WhatsApp link generation

### E2E Tests
- [ ] Cypress: flujo completo de creación
- [ ] Cypress: búsqueda y filtros
- [ ] Cypress: responsive behavior

## Documentación

- [x] README principal actualizado
- [x] CLIENTES_FEATURE_README.md creado
- [x] CLIENTES_ARQUITECTURA.md creado
- [x] CLIENTES_CHECKLIST.md creado
- [ ] JSDoc en funciones complejas
- [ ] Comentarios en código crítico

## Deploy Checklist

### Pre-Deploy
- [ ] Todas las pruebas pasan
- [ ] Build exitoso
- [ ] Variables de entorno configuradas
- [ ] Backend deploy listo

### Post-Deploy
- [ ] Verificar en producción
- [ ] Monitorear errores (Sentry/similar)
- [ ] Verificar performance (Lighthouse)
- [ ] Backup de base de datos

## Próximos Pasos

1. [ ] Implementar edición de clientes
2. [ ] Agregar vista de detalles
3. [ ] Historial de movimientos
4. [ ] Filtros avanzados
5. [ ] Exportar a CSV
6. [ ] Paginación o infinite scroll
7. [ ] Tests automatizados
8. [ ] Optimizaciones de performance

---

**Estado**: ✅ Implementación completa lista para testing
**Fecha**: 2026-02-04
**Pendiente**: Testing manual y ajustes según feedback
