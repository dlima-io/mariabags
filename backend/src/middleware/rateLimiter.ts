import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Rate Limiter simple en memoria
 * Para producción, considerar usar express-rate-limit con Redis
 */
export class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Limpiar store cada 1 hora para evitar memory leaks
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(req: Request): string {
    // Usar IP + username si está disponible para mayor precisión
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const username = req.body?.username || '';
    return `${ip}:${username}`;
  }

  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const key = this.getKey(req);
    const now = Date.now();

    if (!this.store[key] || this.store[key].resetTime < now) {
      // Primera solicitud o ventana expirada
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      next();
      return;
    }

    this.store[key].count++;

    if (this.store[key].count > this.maxRequests) {
      const retryAfter = Math.ceil((this.store[key].resetTime - now) / 1000);
      res.status(429).json({
        error: 'Demasiados intentos. Por favor, intente más tarde.',
        retryAfter
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiter para login (5 intentos por 15 minutos)
 */
export const loginRateLimiter = new RateLimiter(15 * 60 * 1000, 5);

/**
 * Rate limiter para cambio de contraseña (3 intentos por 15 minutos)
 */
export const passwordChangeRateLimiter = new RateLimiter(15 * 60 * 1000, 3);

/**
 * Rate limiter para refresh token (10 intentos por hora)
 */
export const refreshTokenRateLimiter = new RateLimiter(60 * 60 * 1000, 10);
