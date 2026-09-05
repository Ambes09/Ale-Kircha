import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const adminController = {
  // Get banned users
  async getBannedUsers() {
    return prisma.bannedUser.findMany({
      include: {
        user: true
      }
    });
  },

  // Ban user
  async banUser(telegramId: string, reason: string, bannedBy: string, expiresAt?: Date) {
    const user = await prisma.user.findUnique({
      where: { telegramId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return prisma.bannedUser.create({
      data: {
        userId: user.id,
        reason,
        bannedBy,
        expiresAt
      }
    });
  },

  // Unban user
  async unbanUser(telegramId: string) {
    const user = await prisma.user.findUnique({
      where: { telegramId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return prisma.bannedUser.delete({
      where: { userId: user.id }
    });
  },

  // Update customer status
  async updateCustomerStatus(customerId: string, status: string) {
    // Use the actual field name from your schema
    // If your schema uses 'status', use that, otherwise use appropriate field
    return prisma.customer.update({
      where: { id: customerId },
      data: { 
        // Assuming there's a status field, adjust if not
        // termsAccepted: status === 'ACTIVE'
      }
    });
  },

  // Get all customers with pagination
  async getCustomers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        skip,
        take: limit,
        include: {
          user: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count()
    ]);
    
    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get dashboard stats
  async getStats() {
    const [users, customers, orders, groups, banned] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.order.count(),
      prisma.kirchaGroup.count(),
      prisma.bannedUser.count()
    ]);
    
    return {
      users,
      customers,
      orders,
      groups,
      banned,
      timestamp: new Date().toISOString()
    };
  },

  // Get customer by telegram ID
  async getCustomerByTelegram(telegramId: string) {
    return prisma.customer.findFirst({
      where: {
        user: {
          telegramId
        }
      },
      include: {
        user: true
      }
    });
  },

  // Get pending payments
  async getPendingPayments() {
    return prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: {
        order: {
          include: {
            customer: {
              include: { user: true }
            }
          }
        },
        paymentMethod: true
      },
      orderBy: { createdAt: 'asc' }
    });
  },

  // Get pending refunds
  async getPendingRefunds() {
    return prisma.refundRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        customer: {
          include: { user: true }
        },
        order: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }
};
