import { FastifyInstance } from 'fastify';
import { CustomerController } from '../controllers/customerController.js';
import { OrderController } from '../controllers/orderController.js';
import { PaymentController } from '../controllers/paymentController.js';
import { CustomerService } from '../services/customerService.js';
import { OrderService } from '../services/orderService.js';
import { PaymentService } from '../services/paymentService.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { adminRoutes } from './adminRoutes.js';
import { faqRoutes } from './faqRoutes.js';
import { termsRoutes } from './termsRoutes.js';
import { feeRoutes } from './feeRoutes.js';
import { AddressController } from '../controllers/addressController.js';
import { NotificationController } from '../controllers/notificationController.js';
import { SupportController } from '../controllers/supportController.js';
import { ReportController } from '../controllers/reportController.js';
import { KirchaController } from '../controllers/kirchaController.js';
import { KirchaTypeController } from '../controllers/kirchaTypeController.js';
import { PaymentAdviceController } from '../controllers/paymentAdviceController.js';
import { FeeController } from '../controllers/feeController.js';
import { AdminController } from '../controllers/adminController.js';
import { FAQController } from '../controllers/faqController.js';
import { TermsController } from '../controllers/termsController.js';

export async function routes(fastify: FastifyInstance) {
  // Services
  const customerService = new CustomerService();
  const orderService = new OrderService();
  const paymentService = new PaymentService();

  // Controllers
  const customerController = new CustomerController(customerService);
  const orderController = new OrderController(orderService);
  const paymentController = new PaymentController(paymentService);
  const kirchaController = new KirchaController();
  const kirchaTypeController = new KirchaTypeController();
  const addressController = new AddressController();
  const notificationController = new NotificationController();
  const supportController = new SupportController();
  const reportController = new ReportController();
  const paymentAdviceController = new PaymentAdviceController();
  const feeController = new FeeController();
  const adminController = new AdminController();
  const faqController = new FAQController();
  const termsController = new TermsController();

  // ==================== Customer Routes ====================
  fastify.post('/api/v1/customers/register', customerController.register.bind(customerController));
  fastify.get('/api/v1/customers/me', { preHandler: authenticate }, customerController.profile.bind(customerController));
  fastify.put('/api/v1/customers/me', { preHandler: authenticate }, customerController.updateProfile.bind(customerController));
  fastify.get('/api/v1/customers', { preHandler: requireAdmin }, customerController.getAllCustomers.bind(customerController));

  // ==================== Kircha Type Routes ====================
  fastify.get('/api/v1/kircha/types', kirchaTypeController.getAllTypes.bind(kirchaTypeController));
  fastify.get('/api/v1/kircha/types/:id', kirchaTypeController.getType.bind(kirchaTypeController));
  fastify.post('/api/v1/kircha/types', { preHandler: requireAdmin }, kirchaTypeController.createType.bind(kirchaTypeController));
  fastify.put('/api/v1/kircha/types/:id', { preHandler: requireAdmin }, kirchaTypeController.updateType.bind(kirchaTypeController));
  fastify.delete('/api/v1/kircha/types/:id', { preHandler: requireAdmin }, kirchaTypeController.deleteType.bind(kirchaTypeController));

  // ==================== Kircha Group Routes ====================
  fastify.get('/api/v1/kircha/groups', kirchaController.getAllGroups.bind(kirchaController));
  fastify.get('/api/v1/kircha/groups/available', kirchaController.getAvailableGroups.bind(kirchaController));
  fastify.get('/api/v1/kircha/groups/:id', kirchaController.getGroup.bind(kirchaController));
  fastify.post('/api/v1/kircha/groups', { preHandler: requireAdmin }, kirchaController.createGroup.bind(kirchaController));
  fastify.put('/api/v1/kircha/groups/:id', { preHandler: requireAdmin }, kirchaController.updateGroup.bind(kirchaController));
  fastify.delete('/api/v1/kircha/groups/:id', { preHandler: requireAdmin }, kirchaController.deleteGroup.bind(kirchaController));
  fastify.patch('/api/v1/kircha/groups/:id/status', { preHandler: requireAdmin }, kirchaController.updateGroupStatus.bind(kirchaController));
  fastify.post('/api/v1/kircha/groups/:id/join', { preHandler: authenticate }, kirchaController.joinGroup.bind(kirchaController));
  fastify.post('/api/v1/kircha/groups/migrate', { preHandler: requireAdmin }, kirchaController.migrateUser.bind(kirchaController));

  // ==================== Order Routes ====================
  fastify.post('/api/v1/orders', { preHandler: authenticate }, orderController.createOrder.bind(orderController));
  fastify.get('/api/v1/orders/my', { preHandler: authenticate }, orderController.getMyOrders.bind(orderController));
  fastify.get('/api/v1/orders/:id', { preHandler: authenticate }, orderController.getOrder.bind(orderController));
  fastify.patch('/api/v1/orders/:id/status', { preHandler: requireAdmin }, orderController.updateStatus.bind(orderController));
  fastify.post('/api/v1/orders/:id/cancel', { preHandler: authenticate }, orderController.cancelOrder.bind(orderController));
  fastify.get('/api/v1/orders/:id/track', { preHandler: authenticate }, orderController.trackOrder.bind(orderController));

  // ==================== Payment Routes ====================
  fastify.get('/api/v1/payment/methods', paymentController.getPaymentMethods.bind(paymentController));
  fastify.post('/api/v1/payment/advice', { preHandler: authenticate }, paymentController.submitPaymentAdvice.bind(paymentController));
  fastify.post('/api/v1/payment/:id/verify', { preHandler: requireAdmin }, paymentController.verifyPayment.bind(paymentController));
  fastify.post('/api/v1/payment/advice/upload', { preHandler: authenticate }, paymentAdviceController.uploadAdvice.bind(paymentAdviceController));
  fastify.get('/api/v1/payment/advice/:id', { preHandler: authenticate }, paymentAdviceController.getAdvice.bind(paymentAdviceController));
  fastify.get('/api/v1/payment/advice/by-payment/:paymentId', { preHandler: authenticate }, paymentAdviceController.getAdviceByPayment.bind(paymentAdviceController));

  // ==================== Address Routes ====================
  fastify.get('/api/v1/addresses', { preHandler: authenticate }, addressController.getAddresses.bind(addressController));
  fastify.post('/api/v1/addresses', { preHandler: authenticate }, addressController.createAddress.bind(addressController));
  fastify.put('/api/v1/addresses/:id', { preHandler: authenticate }, addressController.updateAddress.bind(addressController));
  fastify.delete('/api/v1/addresses/:id', { preHandler: authenticate }, addressController.deleteAddress.bind(addressController));
  fastify.patch('/api/v1/addresses/:id/default', { preHandler: authenticate }, addressController.setDefaultAddress.bind(addressController));

  // ==================== Notification Routes ====================
  fastify.get('/api/v1/notifications', { preHandler: authenticate }, notificationController.getMyNotifications.bind(notificationController));
  fastify.patch('/api/v1/notifications/:id/read', { preHandler: authenticate }, notificationController.markRead.bind(notificationController));
  fastify.patch('/api/v1/notifications/read-all', { preHandler: authenticate }, notificationController.markAllRead.bind(notificationController));
  fastify.get('/api/v1/notifications/unread-count', { preHandler: authenticate }, notificationController.getUnreadCount.bind(notificationController));

  // ==================== Support Routes ====================
  fastify.post('/api/v1/support', { preHandler: authenticate }, supportController.createRequest.bind(supportController));
  fastify.get('/api/v1/support/my', { preHandler: authenticate }, supportController.getMyRequests.bind(supportController));

  // ==================== Admin Routes ====================
  await fastify.register(adminRoutes);

  // ==================== FAQ Routes ====================
  await fastify.register(faqRoutes);

  // ==================== Terms & Privacy Routes ====================
  await fastify.register(termsRoutes);

  // ==================== Fee Routes ====================
  await fastify.register(feeRoutes);

  // ==================== Report Routes ====================
  fastify.get('/api/v1/admin/reports/sales', { preHandler: requireAdmin }, reportController.getSalesReport.bind(reportController));
  fastify.get('/api/v1/admin/reports/orders', { preHandler: requireAdmin }, reportController.getOrderReport.bind(reportController));
  fastify.get('/api/v1/admin/reports/payments', { preHandler: requireAdmin }, reportController.getPaymentReport.bind(reportController));
  fastify.get('/api/v1/admin/reports/delivery', { preHandler: requireAdmin }, reportController.getDeliveryReport.bind(reportController));
  fastify.get('/api/v1/admin/reports/customers', { preHandler: requireAdmin }, reportController.getCustomerReport.bind(reportController));
  fastify.get('/api/v1/admin/reports/groups', { preHandler: requireAdmin }, reportController.getGroupReport.bind(reportController));

  // ==================== Fee Calculate (Public) ====================
  fastify.post('/api/v1/fees/calculate', feeController.calculateOrderFees.bind(feeController));

  // ==================== Health Check ====================
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));
}
