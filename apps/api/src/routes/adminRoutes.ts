import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export async function adminRoutes(fastify: FastifyInstance) {
  const adminController = new AdminController();

  // Existing routes
  fastify.post('/api/v1/admin/check', adminController.checkAdmin.bind(adminController));
  fastify.get('/api/v1/admin/stats', { preHandler: authenticate }, adminController.getStats.bind(adminController));
  fastify.get('/api/v1/orders', { preHandler: requireAdmin }, adminController.getAllOrders.bind(adminController));

  // Ban management
  fastify.post('/api/v1/admin/ban', { preHandler: requireAdmin }, adminController.banUser.bind(adminController));
  fastify.delete('/api/v1/admin/ban/:telegramId', { preHandler: requireAdmin }, adminController.unbanUser.bind(adminController));
  fastify.get('/api/v1/admin/banned', { preHandler: requireAdmin }, adminController.getBannedUsers.bind(adminController));

  // Bulk messages
  fastify.post('/api/v1/admin/bulk-message', { preHandler: requireAdmin }, adminController.sendBulkMessage.bind(adminController));
  fastify.get('/api/v1/admin/bulk-messages', { preHandler: requireAdmin }, adminController.getBulkMessages.bind(adminController));
}
