import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';

export class FAQController {
  async getAllFAQs(request: FastifyRequest, reply: FastifyReply) {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    return reply.send({ success: true, data: faqs });
  }

  async getFAQ(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const faq = await prisma.fAQ.findUnique({ where: { id } });
    if (!faq) {
      return reply.status(404).send({ success: false, error: { code: 'FAQ_NOT_FOUND', message: 'FAQ not found' } });
    }
    return reply.send({ success: true, data: faq });
  }

  async createFAQ(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const faq = await prisma.fAQ.create({
      data: {
        order: body.order || 0,
        questionEn: body.questionEn,
        questionAm: body.questionAm,
        answerEn: body.answerEn,
        answerAm: body.answerAm,
        isActive: body.active !== undefined ? body.active : true
      }
    });
    return reply.status(201).send({ success: true, data: faq });
  }

  async updateFAQ(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const faq = await prisma.fAQ.update({
      where: { id },
      data: body
    });
    return reply.send({ success: true, data: faq });
  }

  async deleteFAQ(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await prisma.fAQ.delete({ where: { id } });
    return reply.send({ success: true });
  }
}
