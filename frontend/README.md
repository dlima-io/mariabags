# María Bags - Frontend

Aplicación web mobile-first para el sistema de gestión de cuentas corrientes de María Bags.

## Stack Tecnológico

- **Framework:** React 18
- **Build Tool:** Vite
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Routing:** React Router DOM
- **HTTP Client:** Axios

## Principios de Diseño

### Mobile-First
- Diseño optimizado primero para dispositivos móviles
- Touch targets mínimos de 44px
- Navegación táctil optimizada
- Soporte para safe areas (notch, barras inferiores)

### Paleta de Colores María Bags

**Primary (Rosa Vibrante):**
- 50: `#fdf2f8`
- 100: `#fce7f3`
- 500: `#ec4899` (Principal)
- 600: `#db2777`
- 900: `#831843`

**Accent:**
- White: `#ffffff`
- Black: `#000000`

### Atomic Design

Estructura de componentes siguiendo Atomic Design:

```
components/
├── atoms/        # Elementos básicos (Button, Input, Badge, etc.)
├── molecules/    # Componentes simples (SearchBar, ClientCard, etc.)
├── organisms/    # Componentes complejos (Navigation, ClientList, etc.)
└── templates/    # Layouts (MainLayout)
```

## Estructura de Carpetas

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/      # Componentes UI (Atomic Design)
│   ├── pages/           # Páginas/Vistas
│   ├── services/        # Llamadas API
│   ├── hooks/           # Custom React Hooks
│   ├── context/         # React Context
│   ├── types/           # Definiciones TypeScript
│   ├── utils/           # Utilidades y helpers
│   ├── styles/          # Estilos globales
│   ├── App.tsx          # Componente raíz
│   └── main.tsx         # Punto de entrada
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Scripts Disponibles

```bash
# Desarrollo (puerto 5173)
npm run dev

# Compilar para producción
npm run build

# Preview de build de producción
npm run preview

# Linter
npm run lint
```

## Configuración

1. Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configurar variables de entorno en `.env`:
   - `VITE_API_URL`: URL del backend (default: http://localhost:3000/api)
   - `VITE_APP_NAME`: Nombre de la aplicación
   - `VITE_WHATSAPP_DEFAULT_MESSAGE`: Mensaje predeterminado para WhatsApp

3. Instalar dependencias:
   ```bash
   npm install
   ```

4. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrir navegador en `http://localhost:5173`

## Path Aliases

El proyecto usa path aliases para imports más limpios:

```typescript
import Button from '@components/atoms/Button';
import { useAuth } from '@hooks/useAuth';
import { Cliente } from '@types/Cliente.types';
import { formatCurrency } from '@utils/formatters';
```

Aliases disponibles:
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@pages/*` → `./src/pages/*`
- `@services/*` → `./src/services/*`
- `@hooks/*` → `./src/hooks/*`
- `@types/*` → `./src/types/*`
- `@utils/*` → `./src/utils/*`
- `@context/*` → `./src/context/*`

## Integración con Backend

- El proxy `/api` está configurado en `vite.config.ts` para redirigir a `http://localhost:3000`
- Axios interceptors manejan automáticamente:
  - Inyección de JWT token en headers
  - Redirección a login en errores 401
  - Refresh de token expirado

## Características de UI

### Componentes Base (Tailwind)

```css
/* Botones táctiles */
.btn-touch - Botón con touch target mínimo de 44px

/* Inputs */
.input-primary - Input con estilos María Bags

/* Botones de acción */
.btn-primary - Botón primario rosa vibrante
.btn-secondary - Botón secundario con borde

/* Cards */
.card - Card básica con sombra
.card-hover - Card con efecto hover/active
```

### Safe Areas

Soporte para dispositivos con notch:

```css
.safe-top - Padding superior seguro
.safe-bottom - Padding inferior seguro
.safe-left - Padding izquierdo seguro
.safe-right - Padding derecho seguro
```

### Animaciones

Animaciones predefinidas:
- `animate-fade-in` - Fade in suave
- `animate-slide-up` - Deslizar hacia arriba
- `animate-slide-down` - Deslizar hacia abajo

## Integración con WhatsApp

Utilidad para generar links de WhatsApp:

```typescript
const phoneNumber = '5491112345678';
const message = 'Hola! Tienes una deuda pendiente';
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
```

## Estado Global (Context)

### AuthContext

Gestión de autenticación:

```typescript
const { usuario, token, isAuthenticated, login, logout } = useAuth();
```

## TypeScript

- Modo estricto habilitado
- Path resolution con bundler
- Alias configurados en tsconfig.json
- Types completos para todas las entidades

## Optimizaciones Mobile

1. **Touch Optimization:**
   - `-webkit-tap-highlight-color: transparent`
   - `touch-action: manipulation`
   - Botones con min-h/min-w de 44px

2. **Performance:**
   - Lazy loading de rutas
   - Code splitting
   - Tree shaking automático con Vite

3. **UX:**
   - Feedback visual en interacciones
   - Animaciones suaves (< 300ms)
   - Estados de carga
   - Manejo de errores

## Desarrollo

- Hot Module Replacement (HMR) habilitado
- ESLint configurado
- React DevTools recomendado
- Soporte completo para TypeScript

## Build para Producción

```bash
npm run build
```

Genera carpeta `dist/` optimizada:
- Assets minificados
- CSS optimizado y purgado
- Tree shaking aplicado
- Source maps generados
