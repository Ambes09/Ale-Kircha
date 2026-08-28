import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomerService } from '../services/customerService.js';

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const result = await this.customerService.register(body);
    return reply.status(201).send({
      success: true,
      data: result
    });
  }

  async profile(request: FastifyRequest, reply: FastifyReply) {
    const telegramId = (request as any).user?.telegramId;
    const result = await this.customerService.getProfile(telegramId);
    return reply.send({
      success: true,
      data: result
    });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const telegramId = (request as any).user?.telegramId;
    const body = request.body as any;
    const result = await this.customerService.updateProfile(telegramId, body);
    return reply.send({
      success: true,
      data: result
    });
  }

  async getAllCustomers(request: FastifyRequest, reply: FastifyReply) {
    const prisma = (request as any).server?.prisma || (await import('../lib/prisma.js')).default;
    const customers = await prisma.customer.findMany({
      include: {
        user: true,
        addresses: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return reply.send({
      success: true,
      data: customers
    });
  }
}
