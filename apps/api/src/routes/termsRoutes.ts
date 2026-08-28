import { FastifyInstance } from 'fastify';
import { TermsController } from '../controllers/termsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export async function termsRoutes(fastify: FastifyInstance) {
  const controller = new TermsController();

  // ==================== PUBLIC ====================
  fastify.get('/api/v1/terms/active', controller.getActiveTerms.bind(controller));
  fastify.get('/api/v1/privacy/active', controller.getActivePrivacy.bind(controller));
  fastify.get('/api/v1/terms/:id', controller.getTermsById.bind(controller));

  // ==================== AUTHENTICATED ====================
  fastify.post('/api/v1/terms/accept', { preHandler: authenticate }, controller.acceptTerms.bind(controller));
  fastify.get('/api/v1/terms/status', { preHandler: authenticate }, controller.getAcceptanceStatus.bind(controller));
}
