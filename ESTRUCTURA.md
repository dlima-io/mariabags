# 📁 Estructura del Proyecto María Bags

## Vista General

```
mariabags/
├── backend/                    # API REST Node.js + TypeScript
├── frontend/                   # React + Vite + Tailwind CSS
├── CLAUDE.md                   # Instrucciones del proyecto
├── README.md                   # Documentación principal
├── QUICKSTART.md               # Guía de inicio rápido
├── SETUP_COMPLETE.md           # Verificación de setup
└── ESTRUCTURA.md               # Este archivo
```

---

## 🔧 Backend (17 archivos en src/)

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts         # Configuración PostgreSQL Pool
│   │
│   ├── db/
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql    # Esquema completo DB
│   │   └── seeds/              # (vacío - preparado)
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts   # Verificación JWT
│   │   ├── errorHandler.ts     # Manejo centralizado errores
│   │   └── validateInput.ts    # Validación express-validator
│   │
│   ├── types/
│   │   ├── Cliente.types.ts    # Interfaces Cliente
│   │   ├── Configuracion.types.ts
│   │   ├── Movimiento.types.ts # Tipos DEBITO/CREDITO/AJUSTE
│   │   └── Usuario.types.ts    # Auth y roles ADMIN/STAFF
│   │
│   ├── utils/
│   │   ├── sanitizers.ts       # Prevención XSS
│   │   └── validators.ts       # Validadores express-validator
│   │
│   ├── models/                 # (vacío - preparado)
│   ├── services/               # (vacío - preparado)
│   ├── controllers/            # (vacío - preparado)
│   ├── routes/                 # (vacío - preparado)
│   │
│   └── server.ts               # Punto de entrada Express
│
├── package.json                # Dependencias backend
├── tsconfig.json               # Config TypeScript estricto
├── nodemon.json                # Hot reload config
├── .env.example                # Variables de entorno
├── .gitignore                  # Exclusiones git
├── README.md                   # Docs backend
└── node_modules/               # (300 paquetes instalados)
```

### Archivos Críticos Backend

| Archivo | Propósito |
|---------|-----------|
| `src/server.ts` | Express app con helmet, cors, morgan, health check |
| `src/config/database.ts` | Pool PostgreSQL + test conexión |
| `src/db/migrations/001_initial_schema.sql` | Esquema completo: usuarios, clientes, movimientos, configuracion, vista materializada |
| `src/middleware/authMiddleware.ts` | JWT verification + requireRole |
| `src/types/*.types.ts` | Interfaces TypeScript para todas las entidades |
| `src/utils/validators.ts` | Validadores para clientes, movimientos, usuarios |

---

## 🎨 Frontend (19 archivos en src/)

```
frontend/
├── public/
│   └── (vacío - preparado para favicon)
│
├── src/
│   ├── components/
│   │   ├── atoms/              # (vacío - preparado)
│   │   ├── molecules/          # (vacío - preparado)
│   │   ├── organisms/          # (vacío - preparado)
│   │   └── templates/          # (vacío - preparado)
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Estado global autenticación
│   │
│   ├── pages/                  # (vacío - preparado)
│   │
│   ├── services/
│   │   └── api.ts              # Axios con interceptors JWT
│   │
│   ├── hooks/                  # (vacío - preparado)
│   │
│   ├── types/
│   │   ├── Cliente.types.ts    # Interfaces Cliente
│   │   ├── Movimiento.types.ts # Tipos movimientos
│   │   └── Usuario.types.ts    # Auth types
│   │
│   ├── utils/
│   │   ├── constants.ts        # Constantes globales
│   │   ├── formatters.ts       # Formateo moneda, fecha, teléfono
│   │   └── validators.ts       # Validaciones frontend
│   │
│   ├── styles/
│   │   └── globals.css         # Tailwind + clases custom
│   │
│   ├── App.tsx                 # Router + AuthProvider
│   ├── main.tsx                # Entrypoint React
│   └── vite-env.d.ts           # Types env variables
│
├── index.html                  # HTML base con meta tags
├── package.json                # Dependencias frontend
├── tsconfig.json               # Config TypeScript + aliases
├── tsconfig.node.json          # Config Vite
├── vite.config.ts              # Vite + aliases + proxy
├── tailwind.config.js          # Paleta María Bags
├── postcss.config.js           # Tailwind + Autoprefixer
├── .env.example                # Variables de entorno
├── .gitignore                  # Exclusiones git
├── README.md                   # Docs frontend
└── node_modules/               # (279 paquetes instalados)
```

### Archivos Críticos Frontend

| Archivo | Propósito |
|---------|-----------|
| `src/App.tsx` | BrowserRouter + AuthProvider + rutas |
| `src/context/AuthContext.tsx` | Estado global: usuario, token, login(), logout() |
| `src/services/api.ts` | Axios con JWT injection + 401 handler |
| `src/styles/globals.css` | Tailwind + .btn-touch, .btn-primary, safe areas |
| `tailwind.config.js` | Paleta rosa vibrante + animaciones |
| `vite.config.ts` | Path aliases (@components, @pages, etc.) + proxy /api |
| `src/utils/formatters.ts` | formatCurrency(), formatDate(), formatPhone() |

---

## 🎯 Path Aliases Configurados

### Frontend (Vite + TypeScript)

```typescript
import Button from '@components/atoms/Button';
import { useAuth } from '@hooks/useAuth';
import { Cliente } from '@types/Cliente.types';
import { formatCurrency } from '@utils/formatters';
import api from '@services/api';
```

**Aliases disponibles:**
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@pages/*` → `./src/pages/*`
- `@services/*` → `./src/services/*`
- `@hooks/*` → `./src/hooks/*`
- `@types/*` → `./src/types/*`
- `@utils/*` → `./src/utils/*`
- `@context/*` → `./src/context/*`

---

## 📊 Resumen Numérico

### Backend
- **Archivos TypeScript:** 12
- **Migraciones SQL:** 1
- **Archivos Config:** 4 (package.json, tsconfig.json, nodemon.json, .env.example)
- **Documentación:** 1 README.md
- **Carpetas preparadas:** 4 (models, services, controllers, routes)
- **Dependencias:** 300 paquetes npm

### Frontend
- **Archivos TypeScript/TSX:** 12
- **Estilos CSS:** 1
- **HTML:** 1
- **Archivos Config:** 6 (package.json, tsconfig.json, vite.config.ts, tailwind.config.js, etc.)
- **Documentación:** 1 README.md
- **Carpetas preparadas:** 6 (components/atoms-molecules-organisms-templates, pages, hooks)
- **Dependencias:** 279 paquetes npm

### Total Proyecto
- **Archivos fuente:** 36 archivos
- **Líneas de código:** ~3,500 líneas (estimado)
- **Documentación:** 5 archivos MD (README.md, CLAUDE.md, QUICKSTART.md, SETUP_COMPLETE.md, ESTRUCTURA.md)

---

## 🗄️ Esquema de Base de Datos

### Tablas

1. **usuarios**
   - id (UUID PK)
   - username (UNIQUE)
   - password_hash
   - rol (ADMIN | STAFF)

2. **clientes**
   - id (UUID PK)
   - nombre, apellido
   - telefono (UNIQUE) ⭐ No usa DNI
   - activo (boolean) ⭐ Soft delete
   - fecha_creacion

3. **movimientos**
   - id (UUID PK)
   - cliente_id (FK)
   - usuario_id (FK) ⭐ Auditoría
   - tipo (DEBITO | CREDITO | AJUSTE)
   - monto (DECIMAL)
   - fecha
   - observaciones

4. **configuracion**
   - clave (PK)
   - valor
   - updated_at

### Vistas

- **saldos_clientes** (Materializada)
  - Auto-refresh con triggers
  - Calcula: SUM(CREDITOS) - SUM(DEBITOS) + SUM(AJUSTES)

### Funciones y Triggers

- `refresh_saldos_clientes()` - Auto-refresh vista
- `update_updated_at_column()` - Timestamp automático
- Triggers en usuarios, clientes, configuracion, movimientos

---

## 🎨 Diseño UI (Tailwind Classes)

### Componentes Base

```css
.btn-touch          /* Touch target 44px mínimo */
.btn-primary        /* Botón rosa vibrante */
.btn-secondary      /* Botón con borde rosa */
.input-primary      /* Input con focus rosa */
.card               /* Card con sombra */
.card-hover         /* Card con efectos hover/active */
```

### Safe Areas

```css
.safe-top           /* Padding superior (notch) */
.safe-bottom        /* Padding inferior (barra home) */
.safe-left          /* Padding izquierdo */
.safe-right         /* Padding derecho */
```

### Animaciones

```css
animate-fade-in     /* Fade in suave */
animate-slide-up    /* Deslizar hacia arriba */
animate-slide-down  /* Deslizar hacia abajo */
```

---

## 🔐 Seguridad Implementada

### Backend
- ✅ JWT con expiración configurable
- ✅ Bcrypt (10 rounds) para passwords
- ✅ Helmet (headers HTTP seguros)
- ✅ CORS configurado
- ✅ express-validator en todos los endpoints
- ✅ Sanitización contra XSS
- ✅ Prevención SQL Injection (pg parameterized queries)
- ✅ Auditoría (usuario_id en movimientos)

### Frontend
- ✅ JWT token en localStorage
- ✅ Axios interceptors (request + response)
- ✅ Auto-logout en 401
- ✅ Validaciones de inputs
- ✅ XSS prevention (React auto-escape)

---

## 📦 Dependencias Principales

### Backend
- express (Framework)
- pg (PostgreSQL client)
- jsonwebtoken (JWT auth)
- bcryptjs (Password hashing)
- helmet (Security headers)
- cors (CORS middleware)
- express-validator (Input validation)
- morgan (HTTP logger)

### Frontend
- react + react-dom
- react-router-dom (Routing)
- axios (HTTP client)
- framer-motion (Animations)
- lucide-react (Icons)
- tailwindcss (Utility CSS)

---

## ✅ Estado Actual

**COMPLETADO:**
- ✅ Estructura completa de carpetas
- ✅ Configuración de herramientas
- ✅ Esquema de base de datos
- ✅ Sistema de autenticación (estructura)
- ✅ Tipos TypeScript
- ✅ Middleware de seguridad
- ✅ Utilidades y helpers
- ✅ Estilos base mobile-first

**PENDIENTE:**
- ⏳ Lógica de negocio (Models, Services, Controllers)
- ⏳ Endpoints API (Routes)
- ⏳ Componentes UI (Atoms, Molecules, Organisms)
- ⏳ Páginas (Login, Dashboard, Clientes, Movimientos)
- ⏳ Custom Hooks
- ⏳ Integración WhatsApp

---

**📖 Para más información:**
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- Inicio Rápido: `QUICKSTART.md`
- Verificación: `SETUP_COMPLETE.md`
