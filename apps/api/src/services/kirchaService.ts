import prisma from '../lib/prisma.js';
import { KirchaGroupRepository } from '../repositories/kirchaGroupRepository.js';
import { generateGroupCode } from '../utils/orderNumber.js';
import { NotFoundError, ConflictError } from '../errors/index.js';

export class KirchaService {
  private groupRepo: KirchaGroupRepository;

  constructor() {
    this.groupRepo = new KirchaGroupRepository(prisma);
  }

  async getAvailableGroups() {
    return this.groupRepo.findAvailable();
  }

  async getGroupDetails(id: string) {
    const group = await this.groupRepo.findById(id);
    if (!group) {
      throw new NotFoundError('Kircha group');
    }
    return group;
  }

  async createGroup(data: any) {
    const groupCode = generateGroupCode();
    return this.groupRepo.create({
      ...data,
      groupCode
    });
  }

  async joinGroup(groupId: string, customerId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const group = await tx.kirchaGroup.findUnique({
        where: { id: groupId }
      });

      if (!group) {
        throw new NotFoundError('Kircha group');
      }

      if (group.status !== 'OPEN') {
        throw new ConflictError('Group is not open');
      }

      const available = group.totalCapacity - group.reservedQuantity - group.soldQuantity;
      if (quantity > available) {
        throw new ConflictError('Not enough capacity available');
      }

      const membership = await tx.kirchaGroupMembership.create({
        data: {
          groupId,
          customerId,
          quantity,
          portionType: 'FULL',
          unitPrice: group.unitPrice,
          subtotal: group.unitPrice * quantity,
          discount: 0,
          deliveryFee: group.deliveryFee,
          additionalFees: group.additionalFees,
          tax: group.tax,
          totalAmount: (group.unitPrice * quantity) + group.deliveryFee + group.additionalFees - 0 + group.tax,
          reservationStatus: 'RESERVED'
        }
      });

      await tx.kirchaGroup.update({
        where: { id: groupId },
        data: {
          reservedQuantity: group.reservedQuantity + quantity
        }
      });

      return membership;
    });
  }
}
