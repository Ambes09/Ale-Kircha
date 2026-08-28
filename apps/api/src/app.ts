import fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { env } from './config/env.js';
import { logger } from './plugins/logger.js';
import { routes } from './routes/index.js';
import prisma from './lib/prisma.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger,
    trustProxy: true,
    requestIdHeader: 'x-request-id',
  });

  // Register plugins
  await app.register(helmet);
  await app.register(cors, { origin: env.CORS_ORIGINS, credentials: true });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(multipart, {
    limits: {
      fileSize: env.PAYMENT_ADVICE_MAX_SIZE,
      files: 1,
    },
  });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    const statusCode = (error as any).statusCode || 500;
    request.log.error(error);
    reply.status(statusCode).send({
      success: false,
      error: {
        code: (error as any).code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Internal server error',
      },
    });
  });

  // Register routes
  await app.register(routes);

  // Disconnect Prisma on app close
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
