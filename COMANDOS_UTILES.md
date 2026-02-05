# Comandos Útiles - María Bags

## Desarrollo Frontend

```bash
# Iniciar servidor de desarrollo
cd frontend
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Fix automático de problemas de lint
npm run lint -- --fix

# Verificar tipos TypeScript
npx tsc --noEmit
```

## Desarrollo Backend

```bash
# Iniciar servidor backend
cd backend
npm run dev

# Build TypeScript
npm run build

# Ejecutar en producción
npm start

# Migrar base de datos
npm run migrate

# Seed de datos de prueba
npm run seed
```

## Git

```bash
# Estado actual
git status

# Agregar cambios
git add .

# Commit con mensaje
git commit -m "feat: agregar pantalla de gestión de clientes"

# Push al remoto
git push origin main

# Crear nueva rama
git checkout -b feature/nombre-feature

# Ver historial
git log --oneline --graph
```

## Base de Datos PostgreSQL

```bash
# Conectar a PostgreSQL (Windows - PSQL)
psql -U postgres -d mariabags

# Conectar a PostgreSQL (Docker)
docker exec -it postgres_container psql -U postgres -d mariabags

# Listar tablas
\dt

# Ver estructura de tabla
\d clientes

# Consultas útiles
SELECT * FROM clientes LIMIT 10;
SELECT * FROM clientes WHERE activo = true;
SELECT COUNT(*) FROM clientes;

# Salir de PSQL
\q
```

## Docker (si se usa)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Rebuild de servicios
docker-compose up -d --build

# Ver contenedores corriendo
docker ps

# Eliminar volúmenes
docker-compose down -v
```

## Testing

```bash
# Ejecutar tests frontend
cd frontend
npm test

# Tests con coverage
npm test -- --coverage

# Tests en watch mode
npm test -- --watch

# Tests E2E (Cypress)
npm run cypress:open
npm run cypress:run
```

## Debugging

### Frontend (Chrome DevTools)

```javascript
// En cualquier componente, agregar breakpoint
debugger;

// Console logs estructurados
console.log('Cliente creado:', cliente);
console.table(clientes);
console.error('Error:', error);

// Medir performance
console.time('fetch-clientes');
await fetchClientes();
console.timeEnd('fetch-clientes');
```

### Backend (Node.js)

```bash
# Ejecutar con debugging
node --inspect-brk dist/index.js

# Logs estructurados
console.log('[INFO] Cliente creado:', cliente);
console.error('[ERROR] Error al crear cliente:', error);
```

## Análisis de Bundle

```bash
# Analizar tamaño del bundle
cd frontend
npm run build -- --mode analyze

# Ver dependencias
npm list --depth=0

# Encontrar dependencias duplicadas
npm dedupe

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Performance

```bash
# Lighthouse CI (desde browser)
# Abrir DevTools > Lighthouse > Generate report

# Bundle analyzer
npm install -D vite-plugin-bundle-analyzer
# Agregar al vite.config.ts y correr build

# Ver tamaño de archivos
du -sh frontend/dist/*

# Comprimir para deploy
cd frontend/dist
tar -czf ../dist.tar.gz .
```

## Variables de Entorno

### Frontend (.env)

```bash
# Desarrollo
VITE_API_URL=http://localhost:3000/api

# Producción
VITE_API_URL=https://api.mariabags.com/api
```

### Backend (.env)

```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/mariabags

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# Puerto
PORT=3000

# Entorno
NODE_ENV=development
```

## Troubleshooting

### Error: "Cannot find module"

```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"

```bash
# Encontrar proceso usando el puerto (Windows)
netstat -ano | findstr :3000

# Matar proceso (Windows)
taskkill /PID <PID> /F

# Encontrar proceso (Linux/Mac)
lsof -i :3000

# Matar proceso (Linux/Mac)
kill -9 <PID>
```

### Error: "CORS policy"

```bash
# Verificar configuración CORS en backend
# backend/src/index.ts o app.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL esté corriendo
# Windows
services.msc → Buscar PostgreSQL

# Linux/Mac
sudo systemctl status postgresql

# Verificar conexión
psql -U postgres -h localhost -d mariabags

# Verificar variables de entorno
echo $DATABASE_URL
```

## Optimizaciones

### Optimizar imágenes

```bash
# Instalar sharp
npm install sharp

# Optimizar imágenes
npx sharp input.jpg -o output.jpg --quality 80
```

### Minificar CSS

```bash
# Ya incluido en Vite build, pero manual:
npm install -D cssnano
```

### Code splitting

```typescript
// Ya implementado con lazy loading
const Clientes = lazy(() => import('@/pages/Clientes'));
```

## Utilidades de Desarrollo

### Generar componente rápido

```bash
# Crear estructura de componente
mkdir -p frontend/src/components/atoms/NuevoComponente
touch frontend/src/components/atoms/NuevoComponente/index.tsx
```

### Plantilla de componente

```typescript
import { motion } from 'framer-motion';

interface NuevoComponenteProps {
  // Props aquí
}

const NuevoComponente = ({}: NuevoComponenteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Contenido */}
    </motion.div>
  );
};

export default NuevoComponente;
```

## Shortcuts útiles

### VS Code

```
Ctrl + P          - Buscar archivo
Ctrl + Shift + P  - Command palette
Ctrl + `          - Abrir terminal
Ctrl + B          - Toggle sidebar
Ctrl + /          - Comentar línea
Alt + Up/Down     - Mover línea
Ctrl + D          - Seleccionar siguiente coincidencia
F2                - Renombrar símbolo
Ctrl + Space      - Trigger autocomplete
```

### Chrome DevTools

```
Ctrl + Shift + I  - Abrir DevTools
Ctrl + Shift + C  - Inspeccionar elemento
Ctrl + Shift + M  - Toggle device toolbar
F12               - Abrir console
```

## Scripts Personalizados (package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules",
    "reset": "npm run clean && npm install"
  }
}
```

## Monitoreo y Logs

### Ver logs en tiempo real

```bash
# Frontend (browser console)
# Backend (terminal)
npm run dev | npx pino-pretty

# Tail de logs
tail -f logs/app.log
```

### Estructura de logs recomendada

```typescript
// Logger con niveles
const logger = {
  info: (msg: string, data?: any) => console.log('[INFO]', msg, data),
  error: (msg: string, error?: any) => console.error('[ERROR]', msg, error),
  warn: (msg: string, data?: any) => console.warn('[WARN]', msg, data),
  debug: (msg: string, data?: any) => console.debug('[DEBUG]', msg, data),
};
```

## Deploy

### Netlify (Frontend)

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Variables de entorno
netlify env:set VITE_API_URL https://api.mariabags.com/api
```

### Vercel (Frontend)

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Variables de entorno
vercel env add VITE_API_URL
```

### Heroku (Backend)

```bash
# Login
heroku login

# Crear app
heroku create mariabags-api

# Deploy
git push heroku main

# Variables de entorno
heroku config:set JWT_SECRET=your_secret_here
heroku config:set DATABASE_URL=postgres://...

# Ver logs
heroku logs --tail
```

## Recursos Útiles

### Documentación
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion
- TypeScript: https://www.typescriptlang.org
- Node.js: https://nodejs.org

### Herramientas
- Figma (diseño): https://figma.com
- Postman (API testing): https://postman.com
- DB Diagram (schemas): https://dbdiagram.io

---

**Última actualización**: 2026-02-04
