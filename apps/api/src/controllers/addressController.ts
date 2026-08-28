import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';

export class AddressController {
  async getAddresses(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    const customer = await prisma.customer.findUnique({
      where: { userId: user.customerId }
    });
    if (!customer) throw new NotFoundError('Customer');
    
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: { isDefault: 'desc' }
    });
    return reply.send({ success: true, data: addresses });
  }

  async createAddress(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    const body = request.body as any;
    
    const customer = await prisma.customer.findUnique({
      where: { userId: user.customerId }
    });
    if (!customer) throw new NotFoundError('Customer');
    
    const address = await prisma.customerAddress.create({
      data: {
        ...body,
        customerId: customer.id
      }
    });
    return reply.status(201).send({ success: true, data: address });
  }

  async updateAddress(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const address = await prisma.customerAddress.update({
      where: { id },
      data: body
    });
    return reply.send({ success: true, data: address });
  }

  async deleteAddress(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await prisma.customerAddress.delete({ where: { id } });
    return reply.send({ success: true });
  }

  async setDefaultAddress(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = (request as any).user;
    
    const customer = await prisma.customer.findUnique({
      where: { userId: user.customerId }
    });
    if (!customer) throw new NotFoundError('Customer');
    
    await prisma.customerAddress.updateMany({
      where: { customerId: customer.id, isDefault: true },
      data: { isDefault: false }
    });
    
    const address = await prisma.customerAddress.update({
      where: { id },
      data: { isDefault: true }
    });
    return reply.send({ success: true, data: address });
  }
}
