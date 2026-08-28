import { FastifyInstance } from 'fastify';
import { FeeController } from '../controllers/feeController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export async function feeRoutes(fastify: FastifyInstance) {
  const controller = new FeeController();

  // ==================== PUBLIC ====================
  // This is also registered in main index.ts for visibility
  // fastify.post('/api/v1/fees/calculate', controller.calculateOrderFees.bind(controller));

  // ==================== ADMIN ====================
  fastify.get('/api/v1/admin/fees', { preHandler: requireAdmin }, controller.getFeeConfigs.bind(controller));
  fastify.get('/api/v1/admin/fees/:id', { preHandler: requireAdmin }, controller.getFeeConfig.bind(controller));
  fastify.post('/api/v1/admin/fees', { preHandler: requireAdmin }, controller.createFeeConfig.bind(controller));
  fastify.put('/api/v1/admin/fees/:id', { preHandler: requireAdmin }, controller.updateFeeConfig.bind(controller));
  fastify.delete('/api/v1/admin/fees/:id', { preHandler: requireAdmin }, controller.deleteFeeConfig.bind(controller));
  fastify.get('/api/v1/admin/fees/summary', { preHandler: requireAdmin }, controller.getFeeSummary.bind(controller));

  // ==================== DELIVERY ZONES ====================
  fastify.get('/api/v1/admin/delivery-zones', { preHandler: requireAdmin }, controller.getDeliveryZones.bind(controller));
  fastify.post('/api/v1/admin/delivery-zones', { preHandler: requireAdmin }, controller.createDeliveryZone.bind(controller));
  fastify.put('/api/v1/admin/delivery-zones/:id', { preHandler: requireAdmin }, controller.updateDeliveryZone.bind(controller));
  fastify.delete('/api/v1/admin/delivery-zones/:id', { preHandler: requireAdmin }, controller.deleteDeliveryZone.bind(controller));
}
