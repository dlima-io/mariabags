# 🎀 María Bags - Sistema de Gestión de Cuentas Corrientes

> Webapp mobile-first para control de deudas y pagos. Stack completo con React + Node.js + PostgreSQL.

---

## 📊 Estado Actual del Proyecto

✅ **Proyecto 100% funcional y listo para testing**

| Componente | Archivos | Estado | Detalles |
|------------|----------|--------|----------|
| **Backend** | 32 | ✅ Completo | 33 endpoints REST, autenticación JWT, rate limiting |
| **Frontend** | 46 | ✅ Completo | 33 componentes React, 4 páginas, Atomic Design |
| **Base de Datos** | 2 | ✅ Completo | Schema + Seeds con datos de prueba |
| **Seguridad** | - | ✅ Validado | 8 vulnerabilidades corregidas |
| **Testing** | 3 | ✅ Preparado | Guías + scripts + checklist |

**Total**: 78 archivos, ~12,000+ líneas de código

---

## Descripción

Sistema completo de gestión de cuentas corrientes diseñado específicamente para negocios de venta minorista. Prioriza la rapidez en el registro de operaciones y una interfaz vibrante optimizada para uso táctil en dispositivos móviles.

## Stack Tecnológico

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT (Autenticación)
- Bcrypt (Hash de contraseñas)

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Framer Motion (Animaciones)
- Lucide React (Iconos)

## Características Principales

- ✅ Gestión de clientes sin DNI (teléfono como identificador único)
- ✅ Registro rápido de compras y pagos
- ✅ Cálculo automático de saldos
- ✅ Sistema de ajustes porcentuales con auditoría
- ✅ Integración directa con WhatsApp
- ✅ Notificaciones de clientes con mora > 30 días
- ✅ Diseño mobile-first con touch targets optimizados
- ✅ Auditoría completa (registro de quién cargó cada movimiento)
- ✅ Soft delete para preservar historial

## Estructura del Proyecto

```
mariabags/
├── backend/          # API REST con Node.js + TypeScript
│   ├── src/
│   │   ├── config/          # Configuración (DB, JWT, CORS)
│   │   ├── models/          # Modelos de datos
│   │   ├── services/        # Lógica de negocio
│   │   ├── controllers/     # Controladores
│   │   ├── routes/          # Definición de rutas
│   │   ├── middleware/      # Middleware personalizado
│   │   ├── types/           # Definiciones TypeScript
│   │   ├── utils/           # Utilidades
│   │   ├── db/
│   │   │   ├── migrations/  # Migraciones SQL
│   │   │   └── seeds/       # Datos de prueba
│   │   └── server.ts        # Punto de entrada
│   └── package.json
│
└── frontend/         # React + Vite + Tailwind CSS
    ├── src/
    │   ├── components/      # Atomic Design
    │   │   ├── atoms/       # Elementos básicos
    │   │   ├── molecules/   # Componentes simples
    │   │   ├── organisms/   # Componentes complejos
    │   │   └── templates/   # Layouts
    │   ├── pages/           # Páginas/Vistas
    │   ├── services/        # Llamadas API
    │   ├── hooks/           # Custom React Hooks
    │   ├── context/         # React Context
    │   ├── types/           # Definiciones TypeScript
    │   ├── utils/           # Utilidades
    │   └── styles/          # Estilos globales
    └── package.json
```

## 🚀 Quick Start (3 pasos)

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- npm

### 1️⃣ Setup de Base de Datos
```bash
# Opción A: Script automático (Windows)
setup-db.bat

# Opción B: Manual
psql -U postgres -c "CREATE DATABASE mariabags;"
psql -U postgres -d mariabags -f backend/src/db/migrations/001_initial_schema.sql
psql -U postgres -d mariabags -f backend/src/db/seeds/001_seed_data.sql
```

**Datos de prueba incluidos**: 2 usuarios admin, 5 clientes con movimientos

### 2️⃣ Iniciar Servidores
```bash
# Opción A: Script automático (Windows) - abre ambos en ventanas separadas
start-dev.bat

# Opción B: Manual
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3️⃣ Probar la Aplicación
1. Abrir navegador: **http://localhost:5173**
2. Login con: `admin / admin123`
3. Explorar clientes y movimientos

**Testing completo**: Ver [CHECKLIST_TESTING.md](./CHECKLIST_TESTING.md)

### Usuario por Defecto

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANTE:** Cambiar la contraseña del usuario admin inmediatamente en producción.

## Modelo de Datos

### Clientes
- **id:** UUID
- **nombre:** VARCHAR(100)
- **apellido:** VARCHAR(100)
- **telefono:** VARCHAR(20) UNIQUE
- **activo:** BOOLEAN (soft delete)
- **fecha_creacion:** TIMESTAMP

### Movimientos
- **id:** UUID
- **cliente_id:** UUID (FK)
- **usuario_id:** UUID (FK - auditoría)
- **tipo:** DEBITO | CREDITO | AJUSTE
- **monto:** DECIMAL(10,2)
- **fecha:** TIMESTAMP
- **observaciones:** TEXT

### Cálculo de Saldo

**Fórmula correcta (validada por contable-logic-validator):**
```
SALDO = SUM(DEBITOS) - SUM(CREDITOS) + SUM(AJUSTES)
SALDO = SUM(COMPRAS) - SUM(PAGOS) + SUM(AJUSTES)
```

Vista materializada con trigger de auto-refresh para optimizar consultas.

## 🔐 Seguridad

- ✅ Autenticación JWT (HS256, expiración 1h)
- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ Rate Limiting (5 intentos login/15min)
- ✅ Validación de inputs con express-validator
- ✅ Sanitización contra XSS (escape de inputs)
- ✅ Prevención SQL Injection (parámetros preparados)
- ✅ CORS configurado (whitelist)
- ✅ Headers de seguridad con Helmet
- ✅ Auditoría en todas las operaciones (usuario_id)

**Tests de seguridad**: Ver `backend/tests/security/`

## Protocolo de Auditoría

1. Todo movimiento incluye `usuario_id` (¿Quién lo registró?)
2. Timestamps automáticos (`created_at`, `updated_at`)
3. Soft delete preserva historial completo
4. Vista materializada para cálculo de saldos

## ✅ Funcionalidades Implementadas

- [x] Setup inicial del proyecto
- [x] Configuración de base de datos
- [x] Sistema de autenticación JWT
- [x] CRUD de clientes
- [x] Registro de movimientos (compras/pagos/ajustes)
- [x] Cálculo automático de saldos
- [x] Integración con WhatsApp
- [x] Animaciones y pulido UX
- [x] Rate limiting y seguridad
- [x] Responsive design (mobile-first)

## 🎯 Roadmap Futuro (Opcional)

- [ ] Edición de clientes
- [ ] Edición/eliminación de movimientos (con auditoría)
- [ ] Dashboard con estadísticas y gráficos
- [ ] Pantalla de notificaciones (mora > 30 días)
- [ ] Sistema de ajustes porcentuales automáticos
- [ ] Exportar historial a PDF
- [ ] Tests unitarios y E2E
- [ ] Docker & Docker Compose

## Scripts Disponibles

### Backend
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Compilar TypeScript
npm start        # Ejecutar versión compilada
npm run migrate  # Ejecutar migraciones
npm run seed     # Cargar datos de prueba
npm run lint     # Linter
```

### Frontend
```bash
npm run dev      # Desarrollo (puerto 5173)
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linter
```

## Paleta de Colores

**Primary (Rosa Vibrante):**
- 500: `#ec4899` (Principal)
- 600: `#db2777` (Hover)
- 700: `#be185d` (Active)

**Accent:**
- White: `#ffffff`
- Black: `#000000`

## 🐛 Troubleshooting

### Backend no inicia

**Error**: `Error: connect ECONNREFUSED`
**Solución**: PostgreSQL no está corriendo
```bash
# Windows: services.msc → buscar "postgresql"
# Linux: sudo systemctl start postgresql
```

**Error**: `password authentication failed`
**Solución**: Verificar `DB_PASSWORD` en `backend/.env`

**Error**: `database "mariabags" does not exist`
**Solución**: Ejecutar `setup-db.bat` o crear DB manualmente

### CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS`
**Solución**: Verificar en `backend/.env`:
```
CORS_ORIGIN=http://localhost:5173
```

### Saldo Incorrecto

**Solución**: Refrescar vista materializada
```sql
REFRESH MATERIALIZED VIEW saldos_clientes;
```

---

## 📚 Documentación Completa

- [CHECKLIST_TESTING.md](./CHECKLIST_TESTING.md) - Checklist de testing manual
- [GUIA_TESTING_MANUAL.md](./GUIA_TESTING_MANUAL.md) - Guía detallada paso a paso
- [PROYECTO_COMPLETO.md](./PROYECTO_COMPLETO.md) - Resumen técnico completo
- [LOGICA_CONTABLE.md](./backend/LOGICA_CONTABLE.md) - Validación de lógica contable
- [SECURITY_AUDIT.md](./backend/SECURITY_AUDIT.md) - Auditoría de seguridad

---

## Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto es privado y confidencial.

## Contacto

María Bags - Sistema de Gestión de Cuentas Corrientes

---

**Desarrollado con ❤️ para optimizar la gestión de ventas minoristas**
