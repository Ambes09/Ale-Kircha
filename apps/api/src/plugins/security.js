import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from '../config/env.js';
export async function securityPlugins(app) {
    await app.register(helmet);
    await app.register(cors, {
        origin: env.CORS_ORIGINS || ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-id'],
    });
    await app.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
    });
}
