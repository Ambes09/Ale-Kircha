import { FastifyInstance } from 'fastify';

export async function webhookRoutes(fastify: FastifyInstance) {
  // Customer Bot Webhook
  fastify.post('/webhooks/telegram/customer', async (request, reply) => {
    try {
      const body = request.body;
      fastify.log.info('Customer webhook received:', body);
      return reply.status(200).send({ ok: true });
    } catch (error) {
      fastify.log.error('Customer webhook error:', error);
      return reply.status(500).send({ ok: false });
    }
  });

  // Admin Bot Webhook
  fastify.post('/webhooks/telegram/admin', async (request, reply) => {
    try {
      const body = request.body;
      fastify.log.info('Admin webhook received:', body);
      return reply.status(200).send({ ok: true });
    } catch (error) {
      fastify.log.error('Admin webhook error:', error);
      return reply.status(500).send({ ok: false });
    }
  });
}
