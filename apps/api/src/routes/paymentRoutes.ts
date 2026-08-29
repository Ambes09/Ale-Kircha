import { FastifyInstance } from 'fastify';
import { PaymentController } from '../controllers/paymentController.js';
import { PaymentAdviceController } from '../controllers/paymentAdviceController.js';
import { PaymentService } from '../services/paymentService.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export async function paymentRoutes(fastify: FastifyInstance) {
  const paymentService = new PaymentService();
  const paymentController = new PaymentController(paymentService);
  const adviceController = new PaymentAdviceController();

  fastify.get('/api/v1/payment/methods', paymentController.getPaymentMethods.bind(paymentController));
  fastify.post('/api/v1/payment/advice', { preHandler: authenticate }, paymentController.submitPaymentAdvice.bind(paymentController));
  fastify.post('/api/v1/payment/:id/verify', { preHandler: requireAdmin }, paymentController.verifyPayment.bind(paymentController));
  fastify.post('/api/v1/payment/advice/upload', { preHandler: authenticate }, adviceController.uploadAdvice.bind(adviceController));
  fastify.get('/api/v1/payment/advice/:id', { preHandler: authenticate }, adviceController.getAdvice.bind(adviceController));
  fastify.get('/api/v1/payment/advice/by-payment/:paymentId', { preHandler: authenticate }, adviceController.getAdviceByPayment.bind(adviceController));
}
