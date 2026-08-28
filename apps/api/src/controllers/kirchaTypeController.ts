import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';
import { NotFoundError, ConflictError } from '../errors/index.js';

export class KirchaTypeController {
  async getAllTypes(request: FastifyRequest, reply: FastifyReply) {
    const types = await prisma.kirchaType.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' }
    });
    return reply.send({ success: true, data: types });
  }

  async getType(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const type = await prisma.kirchaType.findUnique({
      where: { id },
      include: { groups: true }
    });
    if (!type) throw new NotFoundError('Kircha type');
    return reply.send({ success: true, data: type });
  }

  async createType(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const type = await prisma.kirchaType.create({
      data: {
        code: body.code,
        nameEn: body.nameEn,
        nameAm: body.nameAm,
        descriptionEn: body.descriptionEn,
        descriptionAm: body.descriptionAm,
        imageUrl: body.imageUrl,
        icon: body.icon,
        displayOrder: body.displayOrder || 0,
        active: body.active !== undefined ? body.active : true
      }
    });
    return reply.status(201).send({ success: true, data: type });
  }

  async updateType(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const type = await prisma.kirchaType.update({
      where: { id },
      data: body
    });
    return reply.send({ success: true, data: type });
  }

  async deleteType(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await prisma.kirchaType.delete({ where: { id } });
    return reply.send({ success: true });
  }
}
