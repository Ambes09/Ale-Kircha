import { FastifyInstance } from 'fastify';
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function loggingPlugin(app: FastifyInstance) {
  app.decorate('logger', logger);
  
  app.addHook('onRequest', (request, reply, done) => {
    request.log.info({ 
      method: request.method, 
      url: request.url,
      ip: request.ip,
    });
    done();
  });
  
  app.addHook('onResponse', (request, reply, done) => {
    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    });
    done();
  });
}
