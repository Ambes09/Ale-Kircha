import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
export async function securityPlugins(fastify) {
    // Helmet for security headers
    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        noSniff: true,
        referrerPolicy: { policy: 'same-origin' },
    });
    // CORS configuration
    await fastify.register(cors, {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-id'],
    });
    // Rate limiting
    await fastify.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
        keyGenerator: (req) => {
            return req.headers['x-telegram-id'] || req.ip || 'unknown';
        },
        skip: (req) => {
            // Skip rate limit for health checks
            return req.url === '/health';
        },
    });
}
