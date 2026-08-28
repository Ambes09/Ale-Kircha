import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from '../config/env.js';

export async function securityPlugins(app: FastifyInstance) {
  // Helmet - Security Headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", env.API_URL],
      },
    },
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
    xssFilter: true,
    frameguard: { action: 'deny' },
  });

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGINS || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-id'],
  });

  // Rate Limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req: any) => {
      return req.headers['x-telegram-id'] || req.ip || 'unknown';
    },
    skip: (req: any) => req.url === '/health',
  });
}
