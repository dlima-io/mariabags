# Componentes - María Bags

Sistema de componentes basado en **Atomic Design** para la aplicación María Bags.

## Estructura

```
components/
├── atoms/          # Componentes básicos (Button, Input, Logo)
├── molecules/      # Combinaciones simples (FormField, LoginForm)
├── organisms/      # Componentes complejos (pendiente)
├── templates/      # Plantillas de página (pendiente)
└── ProtectedRoute.tsx  # Componente de protección de rutas
```

## Atoms (Átomos)

### Button
Botón reutilizable con múltiples variantes y estados.

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false)
- `icon`: LucideIcon (opcional)
- `iconPosition`: 'left' | 'right' (default: 'left')
- `fullWidth`: boolean (default: false)

**Características:**
- Touch target mínimo de 44px
- Animaciones de hover y tap con Framer Motion
- Estado de loading con spinner
- Soporte para iconos de Lucide React

**Ejemplo:**
```tsx
import Button from '@/components/atoms/Button';
import { LogIn } from 'lucide-react';

<Button
  variant="primary"
  size="lg"
  icon={LogIn}
  onClick={handleClick}
>
  Iniciar Sesión
</Button>
```

### Input
Campo de entrada con soporte para iconos y validación.

**Props:**
- `icon`: LucideIcon (opcional)
- `error`: boolean (default: false)
- `helperText`: string (opcional)
- Todos los props de HTMLInputElement

**Características:**
- Border rosa vibrante en focus
- Animación shake en error
- Soporte para mensaje de ayuda/error
- Touch target mínimo de 44px

**Ejemplo:**
```tsx
import Input from '@/components/atoms/Input';
import { User } from 'lucide-react';

<Input
  icon={User}
  placeholder="Usuario"
  error={!!errors.username}
  helperText={errors.username}
/>
```

### Logo
Logo/marca de María Bags con animaciones.

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `showSubtitle`: boolean (default: true)
- `animated`: boolean (default: true)

**Características:**
- Diseño con gradiente rosa
- Icono de bolsa (ShoppingBag)
- Animaciones de entrada opcionales
- Hover y tap effects

**Ejemplo:**
```tsx
import Logo from '@/components/atoms/Logo';

<Logo size="lg" showSubtitle animated />
```

## Molecules (Moléculas)

### FormField
Campo de formulario completo (label + input + error).

**Props:**
- `label`: string (requerido)
- `icon`: LucideIcon (opcional)
- `error`: string (opcional)
- Todos los props de HTMLInputElement

**Características:**
- Combina label, Input y mensaje de error
- Animaciones de entrada
- Gestión automática de IDs

**Ejemplo:**
```tsx
import FormField from '@/components/molecules/FormField';
import { Lock } from 'lucide-react';

<FormField
  label="Contraseña"
  icon={Lock}
  type="password"
  error={errors.password}
/>
```

### LoginForm
Formulario completo de inicio de sesión.

**Props:**
- `username`: string
- `password`: string
- `errors`: { username?, password?, general? }
- `isLoading`: boolean
- `onUsernameChange`: (value: string) => void
- `onPasswordChange`: (value: string) => void
- `onSubmit`: (e: FormEvent) => void
- `usernameRef`: RefObject<HTMLInputElement> (opcional)

**Características:**
- Incluye campos de username y password
- Mensaje de error general
- Botón de submit con loading state
- Animaciones en cascada

**Ejemplo:**
```tsx
import LoginForm from '@/components/molecules/LoginForm';

<LoginForm
  username={username}
  password={password}
  errors={errors}
  isLoading={isLoading}
  onUsernameChange={setUsername}
  onPasswordChange={setPassword}
  onSubmit={handleSubmit}
/>
```

## Componentes Especiales

### ProtectedRoute
Componente para proteger rutas que requieren autenticación.

**Props:**
- `children`: ReactNode

**Características:**
- Verifica autenticación antes de renderizar
- Redirige a /login si no autenticado
- Muestra spinner durante verificación
- Previene flashes de redirección

**Ejemplo:**
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

<Route path="/" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Guía de Estilo

### Animaciones
- **Micro-interacciones**: 150-250ms (hover, tap)
- **Transiciones de componentes**: 300-400ms (modals, forms)
- **Animaciones de entrada**: 500ms con stagger de 100ms

### Touch Targets
- **Mínimo**: 44px × 44px
- **Recomendado**: 48px × 48px para elementos principales

### Colores
- **Primary**: Rosa vibrante (#ec4899 - primary-500)
- **Accent**: Blanco y Negro
- **Estados de error**: Rojo (#ef4444)
- **Estados de éxito**: Verde (#10b981)

### Espaciado
- **Mobile**: padding de 4-6 (16-24px)
- **Desktop**: padding de 8 (32px)
- **Safe areas**: Usar clases safe-top, safe-bottom

## Best Practices

1. **Siempre usar Framer Motion** para animaciones
2. **Touch targets mínimos** de 44px
3. **Mobile-first** en todos los componentes
4. **Atomic Design** estricto: no saltarse niveles
5. **TypeScript** con tipos explícitos
6. **Comentarios JSDoc** en componentes principales
7. **Props desestructuradas** para mejor legibilidad
8. **ForwardRef** para componentes que lo necesiten (Input, etc.)
