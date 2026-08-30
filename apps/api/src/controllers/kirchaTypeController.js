import prisma from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';
export class KirchaTypeController {
    async getAllTypes(request, reply) {
        const types = await prisma.kirchaType.findMany({
            where: { active: true },
            orderBy: { displayOrder: 'asc' }
        });
        return reply.send({ success: true, data: types });
    }
    async getType(request, reply) {
        const { id } = request.params;
        const type = await prisma.kirchaType.findUnique({
            where: { id },
            include: { groups: true }
        });
        if (!type)
            throw new NotFoundError('Kircha type');
        return reply.send({ success: true, data: type });
    }
    async createType(request, reply) {
        const body = request.body;
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
    async updateType(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const type = await prisma.kirchaType.update({
            where: { id },
            data: body
        });
        return reply.send({ success: true, data: type });
    }
    async deleteType(request, reply) {
        const { id } = request.params;
        await prisma.kirchaType.delete({ where: { id } });
        return reply.send({ success: true });
    }
}
