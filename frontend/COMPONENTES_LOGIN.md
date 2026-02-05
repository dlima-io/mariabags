# Pantalla de Login - María Bags

Sistema completo de autenticación con diseño vibrante, mobile-first y animaciones con Framer Motion.

## Archivos Creados

### Componentes Atómicos (Atoms)
```
src/components/atoms/
├── Button.tsx       - Botón reutilizable con variantes y loading state
├── Input.tsx        - Campo de entrada con iconos y validación
├── Logo.tsx         - Logo animado de María Bags
├── Spinner.tsx      - Indicador de carga animado
└── index.ts         - Barrel export
```

### Componentes Moleculares (Molecules)
```
src/components/molecules/
├── FormField.tsx    - Label + Input + Error message
├── LoginForm.tsx    - Formulario completo de login
└── index.ts         - Barrel export
```

### Páginas
```
src/pages/
├── Login.tsx        - Pantalla de inicio de sesión
└── Dashboard.tsx    - Pantalla principal (placeholder)
```

### Hooks
```
src/hooks/
└── useLogin.ts      - Lógica de autenticación
```

### Componentes de Utilidad
```
src/components/
└── ProtectedRoute.tsx - Protección de rutas autenticadas
```

## Flujo de Autenticación

1. Usuario accede a `/` sin autenticación
2. `ProtectedRoute` detecta falta de auth y redirige a `/login`
3. Usuario ingresa credenciales en `Login` page
4. `useLogin` hook valida y envía petición a `/api/auth/login`
5. Si es exitoso, guarda token y usuario en `AuthContext`
6. Redirige a `/` (Dashboard)
7. `ProtectedRoute` permite el acceso

## Características Implementadas

### Mobile-First Design
- Touch targets mínimos de 44px
- Diseño responsive (móvil → tablet → desktop)
- Safe areas para dispositivos con notch
- Optimizado para uso con una mano

### Animaciones
- Fade in de página completa (500ms)
- Slide up de formulario (500ms con delay)
- Stagger en campos del form (100ms entre cada uno)
- Shake animation en errores de validación
- Bounce en hover de botones
- Spinner rotativo en loading states

### Validaciones
- Username: mínimo 3 caracteres
- Password: mínimo 4 caracteres
- Validación en tiempo real al submit
- Mensajes de error específicos
- Auto-focus en campo de usuario

### Estados Manejados
- Loading state durante login
- Error states con mensajes descriptivos
- Disabled state en campos durante loading
- Success state con redirección automática

### Paleta de Colores
- **Primary:** Rosa vibrante (#ec4899)
- **Background:** Gradiente rosa claro
- **Error:** Rojo (#ef4444)
- **Success:** Verde (#10b981)
- **Neutral:** Grises

## Uso de Componentes

### Button
```tsx
import { Button } from '@/components/atoms';
import { LogIn } from 'lucide-react';

<Button
  variant="primary"    // primary | secondary | ghost
  size="lg"           // sm | md | lg
  icon={LogIn}
  iconPosition="right"
  isLoading={isLoading}
  fullWidth
  onClick={handleClick}
>
  Iniciar Sesión
</Button>
```

### Input
```tsx
import { Input } from '@/components/atoms';
import { User } from 'lucide-react';

<Input
  type="text"
  icon={User}
  placeholder="Usuario"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={!!errors.username}
  helperText={errors.username}
/>
```

### FormField
```tsx
import { FormField } from '@/components/molecules';
import { Lock } from 'lucide-react';

<FormField
  label="Contraseña"
  type="password"
  icon={Lock}
  placeholder="Ingresa tu contraseña"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={errors.password}
/>
```

### Logo
```tsx
import { Logo } from '@/components/atoms';

<Logo
  size="lg"          // sm | md | lg
  showSubtitle       // true | false
  animated           // true | false
/>
```

### ProtectedRoute
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';

<Route path="/" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Custom Hook: useLogin

```tsx
import { useLogin } from '@/hooks/useLogin';

function LoginPage() {
  const {
    username,        // string
    password,        // string
    errors,          // { username?, password?, general? }
    isLoading,       // boolean
    usernameRef,     // RefObject para auto-focus
    setUsername,     // (value: string) => void
    setPassword,     // (value: string) => void
    handleLogin,     // (e: FormEvent) => void
  } = useLogin();

  return (
    <form onSubmit={handleLogin}>
      <input
        ref={usernameRef}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {/* ... */}
    </form>
  );
}
```

## Estructura de Errores

El hook `useLogin` maneja los siguientes tipos de error:

```typescript
interface LoginErrors {
  username?: string;   // Error de validación de username
  password?: string;   // Error de validación de password
  general?: string;    // Error del servidor o de red
}
```

### Mensajes de Error

**Validación:**
- "El usuario es requerido"
- "El usuario debe tener al menos 3 caracteres"
- "La contraseña es requerida"
- "La contraseña debe tener al menos 4 caracteres"

**Servidor:**
- "Usuario o contraseña incorrectos" (401)
- "Usuario no encontrado" (404)
- "Tiempo de espera agotado. Verifica tu conexión" (timeout)
- "Error de conexión. Verifica tu red e intenta nuevamente" (sin conexión)
- "Error al iniciar sesión. Intenta nuevamente" (otros errores)

## API Endpoint Esperado

El sistema espera un endpoint `POST /api/auth/login` que retorne:

```typescript
// Request
{
  "username": "string",
  "password": "string"
}

// Response (200 OK)
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "uuid",
    "username": "string",
    "rol": "ADMIN" | "STAFF"
  }
}

// Error Response (401)
{
  "error": "Credenciales inválidas"
}
```

## Configuración de Rutas

```tsx
// src/App.tsx
<BrowserRouter>
  <Routes>
    {/* Ruta pública */}
    <Route path="/login" element={<Login />} />

    {/* Ruta protegida */}
    <Route path="/" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

## Atomic Design Aplicado

```
Atoms (Básicos)
  ↓
Molecules (Composición simple)
  ↓
Organisms (Pendiente)
  ↓
Templates (Pendiente)
  ↓
Pages (Login, Dashboard)
```

### Atoms
Componentes independientes sin dependencias:
- Button, Input, Logo, Spinner

### Molecules
Combinan varios atoms:
- FormField (Label + Input)
- LoginForm (FormFields + Button)

### Pages
Usan molecules y atoms para crear pantallas completas:
- Login (Logo + LoginForm)
- Dashboard (Logo + Button + Cards)

## Testing Manual

Para probar el sistema de login:

1. Iniciar el servidor backend en `http://localhost:3000`
2. Iniciar el frontend: `npm run dev`
3. Acceder a `http://localhost:5173`
4. Deberías ser redirigido automáticamente a `/login`
5. Ingresar credenciales y probar:
   - Validaciones (campos vacíos, muy cortos)
   - Error de credenciales incorrectas
   - Login exitoso y redirección

## Próximos Pasos

1. Implementar recuperación de contraseña
2. Agregar recordar sesión (checkbox)
3. Implementar logout automático por inactividad
4. Agregar animación de transición entre páginas
5. Implementar Dashboard completo
6. Agregar tests unitarios

## Troubleshooting

### El login no funciona
- Verificar que el backend esté corriendo en `http://localhost:3000`
- Verificar la configuración de CORS en el backend
- Revisar la consola del navegador para errores

### Las animaciones no se ven suaves
- Verificar que Framer Motion esté instalado correctamente
- Verificar que no haya conflictos con otras librerías de animación

### El redirect loop infinito
- Verificar que el token se esté guardando correctamente en localStorage
- Verificar que `AuthContext` esté inicializando correctamente

### Los estilos no se aplican
- Ejecutar `npm run build` para verificar compilación
- Verificar que Tailwind esté configurado correctamente
- Verificar que las clases personalizadas estén en `globals.css`

## Dependencias Necesarias

Todas ya instaladas en el proyecto:
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-router-dom` ^6.21.1
- `framer-motion` ^10.18.0
- `lucide-react` ^0.307.0
- `axios` ^1.6.5
- `tailwindcss` ^3.4.1
- `typescript` ^5.3.3

## Performance

- Build size: ~315 KB (gzipped: ~105 KB)
- Animaciones optimizadas para 60fps
- Lazy loading pendiente de implementar
- Code splitting pendiente de implementar
