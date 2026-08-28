import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';

export class NotificationController {
  async getMyNotifications(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    if (!user || !user.customerId) {
      return reply.send({ success: true, data: [] });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: user.customerId }
    });
    if (!customer) return reply.send({ success: true, data: [] });
    
    const notifications = await prisma.notification.findMany({
      where: { customerId: customer.id },
      orderBy: { sentAt: 'desc' },
      take: 50
    });
    return reply.send({ success: true, data: notifications });
  }

  async markRead(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    return reply.send({ success: true, data: notification });
  }

  async markAllRead(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    if (!user || !user.customerId) {
      return reply.send({ success: true });
    }
    await prisma.notification.updateMany({
      where: { customerId: user.customerId, read: false },
      data: { read: true }
    });
    return reply.send({ success: true });
  }

  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    if (!user || !user.customerId) {
      return reply.send({ success: true, data: { count: 0 } });
    }
    
    const count = await prisma.notification.count({
      where: { customerId: user.customerId, read: false }
    });
    return reply.send({ success: true, data: { count } });
  }
}
