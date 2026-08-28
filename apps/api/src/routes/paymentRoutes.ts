import { FastifyInstance } from 'fastify';
import { PaymentController } from '../controllers/paymentController.js';
import { PaymentAdviceController } from '../controllers/paymentAdviceController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export async function paymentRoutes(fastify: FastifyInstance) {
  const paymentController = new PaymentController();
  const adviceController = new PaymentAdviceController();

  // Payment methods
  fastify.get('/api/v1/payment/methods', paymentController.getPaymentMethods.bind(paymentController));
  fastify.post('/api/v1/payment/advice', { preHandler: authenticate }, paymentController.submitPaymentAdvice.bind(paymentController));
  fastify.post('/api/v1/payment/:id/verify', { preHandler: requireAdmin }, paymentController.verifyPayment.bind(paymentController));
  
  // Payment advice with file upload
  fastify.post('/api/v1/payment/advice/upload', { 
    preHandler: authenticate 
  }, adviceController.uploadAdvice.bind(adviceController));
  
  fastify.get('/api/v1/payment/advice/:id', { preHandler: authenticate }, adviceController.getAdvice.bind(adviceController));
  fastify.get('/api/v1/payment/advice/by-payment/:paymentId', { preHandler: authenticate }, adviceController.getAdviceByPayment.bind(adviceController));
}
