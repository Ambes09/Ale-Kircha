import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';
import { NotFoundError, ConflictError } from '../errors/index.js';
import { generateGroupCode } from '../utils/orderNumber.js';

export class KirchaGroupController {
  async getAllGroups(request: FastifyRequest, reply: FastifyReply) {
    const { status, kirchaTypeId } = request.query as any;
    
    const where: any = {};
    if (status) where.status = status;
    if (kirchaTypeId) where.kirchaTypeId = kirchaTypeId;

    const groups = await prisma.kirchaGroup.findMany({
      where,
      include: {
        kirchaType: true,
        images: true,
        memberships: {
          include: {
            customer: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return reply.send({ success: true, data: groups });
  }

  async getAvailableGroups(request: FastifyRequest, reply: FastifyReply) {
    const groups = await prisma.kirchaGroup.findMany({
      where: {
        status: 'OPEN',
        maxQuota: { gt: 0 },
        registrationCloseAt: { gt: new Date() }
      },
      include: {
        kirchaType: true,
        images: {
          where: { isPrimary: true },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return reply.send({ success: true, data: groups });
  }

  async getGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const group = await prisma.kirchaGroup.findUnique({
      where: { id },
      include: {
        kirchaType: true,
        images: true,
        memberships: {
          include: {
            customer: {
              include: { user: true }
            }
          }
        },
        orders: {
          include: {
            customer: { include: { user: true } },
            payment: true,
            delivery: true
          }
        }
      }
    });
    if (!group) throw new NotFoundError('Kircha group');
    return reply.send({ success: true, data: group });
  }

  async createGroup(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const user = (request as any).user;
    
    const groupCode = generateGroupCode();
    
    const group = await prisma.kirchaGroup.create({
      data: {
        groupCode,
        kirchaTypeId: body.kirchaTypeId,
        name: body.nameEn,
        nameAm: body.nameAm || body.nameEn,
        descriptionEn: body.descriptionEn,
        descriptionAm: body.descriptionAm,
        status: body.status || 'DRAFT',
        maxQuota: body.maxQuota || 0,
        unitPrice: Number(Number(body.unitPrice)) || 0,
        halfPrice: body.halfPrice || null,
        quarterPrice: body.quarterPrice || null,
        deliveryFee: Number(Number(body.deliveryFee)) || 0,
        discount: Number(Number(body.discount)) || 0,
        tax: Number(Number(body.tax)) || 0,
        additionalFee: Number(Number(body.additionalFee)) || 0,
        registrationOpenAt: body.registrationOpenAt || new Date(),
        registrationCloseAt: body.registrationCloseAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        slaughterDate: body.slaughterDate || null,
        slaughterTime: body.slaughterTime || null,
        slaughterLocation: body.slaughterLocation || null,
        processingDate: body.processingDate || null,
        deliveryDate: body.deliveryDate || null,
        deliveryTimeStart: body.deliveryTimeStart || null,
        deliveryTimeEnd: body.deliveryTimeEnd || null,
        deliveryArea: body.deliveryArea || null,
        minQuantity: body.minQuantity || 0.25,
        maxQuantity: body.maxQuantity || 3,
        quantityStep: body.quantityStep || 0.25,
        allowHalfShare: body.allowHalfShare !== undefined ? body.allowHalfShare : true,
        allowQuarterShare: body.allowQuarterShare !== undefined ? body.allowQuarterShare : true,
        createdBy: user?.telegramId || 'system'
      },
      include: {
        kirchaType: true,
        images: true
      }
    });
    return reply.status(201).send({ success: true, data: group });
  }

  async updateGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    const group = await prisma.kirchaGroup.update({
      where: { id },
      data: body,
      include: {
        kirchaType: true,
        images: true
      }
    });
    return reply.send({ success: true, data: group });
  }

  async deleteGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await prisma.kirchaGroup.delete({ where: { id } });
    return reply.send({ success: true });
  }

  async updateGroupStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    
    const group = await prisma.kirchaGroup.update({
      where: { id },
      data: { status }
    });
    return reply.send({ success: true, data: group });
  }

  async joinGroup(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { customerId, quantity, portionType } = request.body as any;
    
    return prisma.$transaction(async (tx) => {
      const group = await tx.kirchaGroup.findUnique({
        where: { id }
      });
      if (!group) throw new NotFoundError('Kircha group');
      if (group.status !== 'OPEN') throw new ConflictError('Group is not open');
      
      const available = group.maxQuota - group.reservedQuota - group.soldQuota;
      if (quantity > available) throw new ConflictError('Not enough capacity');
      
      const unitPrice = portionType === 'HALF' ? (group.halfPrice || Number(Number(group.unitPrice)) / 2) :
                        portionType === 'QUARTER' ? (group.quarterPrice || Number(Number(group.unitPrice)) / 4) :
                        Number(Number(group.unitPrice));
      
      const subtotal = unitPrice * quantity;
      const totalAmount = subtotal + Number(Number(group.deliveryFee)) + Number(Number(group.additionalFee)) - Number(Number(group.discount)) + Number(Number(group.tax));
      
      const membership = await tx.kirchaGroupMembership.create({
        data: {
          groupId: id,
          customerId,
          portionType: portionType || 'FULL',
          quantity,
          unitPrice,
          subtotal,
          discount: Number(Number(group.discount)),
          deliveryFee: Number(Number(group.deliveryFee)),
          additionalFee: Number(Number(group.additionalFee)),
          tax: Number(Number(group.tax)),
          totalAmount,
          reservationStatus: 'RESERVED'
        }
      });
      
      await tx.kirchaGroup.update({
        where: { id },
        data: {
          reservedQuota: group.reservedQuota + quantity
        }
      });
      
      return membership;
    });
  }

  async migrateUser(request: FastifyRequest, reply: FastifyReply) {
    const { fromGroupId, toGroupId, customerId, quantity } = request.body as any;
    
    return prisma.$transaction(async (tx) => {
      // Remove from old group
      const membership = await tx.kirchaGroupMembership.findFirst({
        where: {
          groupId: fromGroupId,
          customerId,
          reservationStatus: 'RESERVED'
        }
      });
      if (!membership) throw new NotFoundError('Membership not found');
      
      await tx.kirchaGroupMembership.update({
        where: { id: membership.id },
        data: { reservationStatus: 'CANCELLED' }
      });
      
      const oldGroup = await tx.kirchaGroup.findUnique({ where: { id: fromGroupId } });
      if (oldGroup) {
        await tx.kirchaGroup.update({
          where: { id: fromGroupId },
          data: {
            reservedQuota: oldGroup.reservedQuota - (quantity || membership.quantity)
          }
        });
      }
      
      // Add to new group
      const newGroup = await tx.kirchaGroup.findUnique({ where: { id: toGroupId } });
      if (!newGroup) throw new NotFoundError('Destination group');
      
      const newMembership = await tx.kirchaGroupMembership.create({
        data: {
          groupId: toGroupId,
          customerId,
          portionType: membership.portionType,
          quantity: quantity || membership.quantity,
          unitPrice: Number(Number(newGroup.unitPrice)),
          subtotal: (quantity || membership.quantity) * Number(Number(newGroup.unitPrice)),
          discount: Number(Number(newGroup.discount)),
          deliveryFee: Number(Number(newGroup.deliveryFee)),
          additionalFee: Number(Number(newGroup.additionalFee)),
          tax: Number(Number(newGroup.tax)),
          totalAmount: (quantity || membership.quantity) * Number(Number(newGroup.unitPrice)) + Number(Number(newGroup.deliveryFee)) + Number(Number(newGroup.additionalFee)) - Number(Number(newGroup.discount)) + Number(Number(newGroup.tax)),
          reservationStatus: 'RESERVED'
        }
      });
      
      await tx.kirchaGroup.update({
        where: { id: toGroupId },
        data: {
          reservedQuota: newGroup.reservedQuota + (quantity || membership.quantity)
        }
      });
      
      return newMembership;
    });
  }
}
