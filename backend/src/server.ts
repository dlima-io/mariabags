import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { pool, testConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes/index';

dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.CORS_ORIGIN, // Origen configurado en .env (producción)
      'http://localhost:5173',
      'http://localhost:5174'
    ].filter(Boolean); // Eliminar valores undefined

    // En desarrollo, permitir también IPs locales
    if (process.env.NODE_ENV === 'development') {
      if (!origin ||
          origin.includes('localhost') ||
          origin.match(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:517[34]$/) ||
          origin.match(/^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:517[34]$/)) {
        callback(null, true);
        return;
      }
    }

    // Verificar si el origen está en la lista permitida
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
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

// Health check endpoint (para Render y monitoreo)
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Verificar conexión a la base de datos
    await pool.query('SELECT NOW()');

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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

// Start server
const startServer = async () => {
  try {
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor María Bags corriendo en puerto ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Network: http://192.168.0.174:${PORT}/api`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
      console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
