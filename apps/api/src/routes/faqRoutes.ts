import { FastifyInstance } from 'fastify';
import { FAQController } from '../controllers/faqController.js';
import { SettingsController } from '../controllers/settingsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export async function faqRoutes(fastify: FastifyInstance) {
  const faqController = new FAQController();
  const settingsController = new SettingsController();

  // Public FAQ routes
  fastify.get('/api/v1/faq', faqController.getAllFAQs.bind(faqController));
  fastify.get('/api/v1/faq/:id', faqController.getFAQ.bind(faqController));
  fastify.get('/api/v1/contact', settingsController.getContactInfo.bind(settingsController));
  fastify.get('/api/v1/settings', settingsController.getSettings.bind(settingsController));

  // Admin FAQ routes
  fastify.post('/api/v1/faq', { preHandler: requireAdmin }, faqController.createFAQ.bind(faqController));
  fastify.put('/api/v1/faq/:id', { preHandler: requireAdmin }, faqController.updateFAQ.bind(faqController));
  fastify.delete('/api/v1/faq/:id', { preHandler: requireAdmin }, faqController.deleteFAQ.bind(faqController));
  
  // Admin Settings routes
  fastify.put('/api/v1/settings/:key', { preHandler: requireAdmin }, settingsController.updateSetting.bind(settingsController));
}
