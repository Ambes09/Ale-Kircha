import { PrismaClient } from '@prisma/client';

export class KirchaGroupRepository {
  constructor(private prisma: PrismaClient) {}

  async findAvailable() {
    return this.prisma.kirchaGroup.findMany({
      where: {
        status: 'OPEN',
        maxQuota: {
          gt: 0
        }
      },
      include: {
        kirchaType: true,
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    });
  }

  async findById(id: string) {
    return this.prisma.kirchaGroup.findUnique({
      where: { id },
      include: {
        kirchaType: true,
        images: true,
        memberships: {
          include: {
            customer: {
              include: {
                user: true
              }
            }
          }
        },
        orders: {
          include: {
            customer: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
  }

  async create(data: any) {
    return this.prisma.kirchaGroup.create({
      data,
      include: {
        kirchaType: true
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.kirchaGroup.update({
      where: { id },
      data,
      include: {
        kirchaType: true
      }
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.kirchaGroup.update({
      where: { id },
      data: { status }
    });
  }
}
