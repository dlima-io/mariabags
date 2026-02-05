# María Bags - Backend API

Backend REST API para el sistema de gestión de cuentas corrientes de María Bags.

## Stack Tecnológico

- **Runtime:** Node.js
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Seguridad:** Helmet, CORS, Bcrypt
- **Validación:** express-validator

## Arquitectura

El proyecto sigue una arquitectura en capas:

```
Routes → Controllers → Services → Models → Database
```

- **Routes:** Definición de endpoints y middlewares específicos
- **Controllers:** Manejo de request/response, validaciones iniciales
- **Services:** Lógica de negocio, orquestación de operaciones
- **Models:** Interacción directa con la base de datos
- **Middleware:** Autenticación, validación, manejo de errores

## Estructura de Carpetas

```
backend/
├── src/
│   ├── config/          # Configuración (DB, JWT, CORS)
│   ├── models/          # Modelos de datos
│   ├── services/        # Lógica de negocio
│   ├── controllers/     # Controladores
│   ├── routes/          # Definición de rutas
│   ├── middleware/      # Middleware personalizado
│   ├── types/           # Definiciones TypeScript
│   ├── utils/           # Utilidades y helpers
│   ├── db/
│   │   ├── migrations/  # Scripts SQL de migración
│   │   └── seeds/       # Datos de prueba
│   └── server.ts        # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts Disponibles

```bash
# Desarrollo (con hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start

# Ejecutar migraciones de base de datos
npm run migrate

# Cargar datos de prueba
npm run seed

# Linter
npm run lint
```

## Configuración

1. Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configurar variables de entorno en `.env`:
   - Credenciales de PostgreSQL
   - JWT secret (generar uno seguro para producción)
   - Puerto y entorno

3. Instalar dependencias:
   ```bash
   npm install
   ```

4. Ejecutar migraciones:
   ```bash
   npm run migrate
   ```

5. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id` - Obtener cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `GET /api/clientes/:id/saldo` - Obtener saldo

### Movimientos
- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Registrar movimiento
- `GET /api/movimientos/:id` - Obtener movimiento

### Usuarios
- `GET /api/usuarios` - Listar usuarios (admin)
- `POST /api/usuarios` - Crear usuario (admin)

## Medidas de Seguridad

1. **Autenticación JWT:** Tokens con expiración configurable
2. **Hashing de Contraseñas:** Bcrypt con 10 rounds
3. **Validación de Inputs:** express-validator en todos los endpoints
4. **Sanitización:** Prevención de XSS y SQL Injection
5. **CORS Configurado:** Solo orígenes permitidos
6. **Helmet:** Headers de seguridad HTTP
7. **Auditoría:** Registro de usuario_id en todos los movimientos
8. **Soft Delete:** Preservación de historial (campo `activo`)

## Modelo de Datos

### Clientes
- **Identificador Único:** Teléfono (no se usa DNI)
- **Soft Delete:** Campo `activo` para desactivar sin eliminar
- **Campos:** id, nombre, apellido, telefono, activo, fecha_creacion

### Movimientos
- **Tipos:** DEBITO (compras), CREDITO (pagos), AJUSTE (correcciones)
- **Auditoría:** Campo `usuario_id` obligatorio
- **Campos:** id, cliente_id, usuario_id, tipo, monto, fecha, observaciones

### Cálculo de Saldo
```
SALDO = SUM(CREDITOS) - SUM(DEBITOS) + SUM(AJUSTES)
```

Vista materializada `saldos_clientes` con auto-refresh mediante triggers.

## Desarrollo

- TypeScript estricto habilitado
- ESLint configurado
- Nodemon para hot reload
- Logs con Morgan (dev/combined según entorno)
- Manejo centralizado de errores

## Producción

Antes de desplegar:

1. Cambiar `JWT_SECRET` a un valor seguro aleatorio
2. Cambiar password del usuario admin por defecto
3. Configurar `NODE_ENV=production`
4. Revisar configuración de CORS
5. Configurar logs persistentes
6. Habilitar SSL/TLS en base de datos
