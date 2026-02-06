import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes/index';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration - permite múltiples orígenes
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CORS_ORIGIN || ''
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    // Permitir si está en la lista de orígenes permitidos
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permitir todos los subdominios de vercel.app (para preview deployments)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // Rechazar otros orígenes
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// Error handling middleware (debe ser el último)
app.use(errorHandler);

// Initialize database connection (para Vercel y local)
const initializeDatabase = async () => {
  try {
    await testConnection();
    console.log('✅ Base de datos conectada correctamente');
  } catch (error) {
    console.error('⚠️  Error al conectar con la base de datos:', error);
    // En Vercel, no hacer exit - dejar que maneje el error
    if (process.env.VERCEL !== '1') {
      console.error('💥 Saliendo debido a error de DB (modo local)');
      process.exit(1);
    }
  }
};

// Solo ejecutar servidor local si NO estamos en Vercel
if (process.env.VERCEL !== '1') {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor María Bags corriendo en puerto ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
      console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
    });
  });
} else {
  // En Vercel, inicializar DB pero no hacer listen
  console.log('🔷 Ejecutando en Vercel (modo serverless)');
  initializeDatabase();
}

// Exportar app para Vercel
export default app;
