import { FastifyRequest, FastifyReply } from 'fastify';
import { PaymentService } from '../services/paymentService.js';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async getPaymentMethods(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.paymentService.getPaymentMethods();
    return reply.send({
      success: true,
      data: result
    });
  }

  async submitPaymentAdvice(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const customerId = (request as any).user?.customerId;
    const result = await this.paymentService.submitPaymentAdvice({
      ...body,
      customerId
    });
    return reply.status(201).send({
      success: true,
      data: result
    });
  }

  async verifyPayment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { status: 'PAID' | 'REJECTED'; rejectionReason?: string };
    const adminId = (request as any).user?.telegramId;
    const result = await this.paymentService.verifyPayment(id, adminId, body.status, body.rejectionReason);
    return reply.send({
      success: true,
      data: result
    });
  }
}
