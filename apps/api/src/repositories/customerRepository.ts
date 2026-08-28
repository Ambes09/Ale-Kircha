import { PrismaClient, Customer } from '@prisma/client';

export class CustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async findByTelegramId(telegramId: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: {
        user: {
          telegramId
        }
      },
      include: {
        user: true,
        addresses: true
      }
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
        addresses: true
      }
    });
  }

  async create(data: {
    telegramId: string;
    firstName: string;
    lastName?: string;
    phone: string;
    fullName: string;
    preferredLanguage: string;
  }): Promise<Customer> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          telegramId: data.telegramId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'CUSTOMER'
        }
      });

      return tx.customer.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          preferredLanguage: data.preferredLanguage,
          status: 'ACTIVE'
        },
        include: {
          user: true
        }
      });
    });
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data,
      include: {
        user: true,
        addresses: true
      }
    });
  }

  async findOrCreateByTelegram(
    telegramId: string,
    userData: {
      firstName: string;
      lastName?: string;
      username?: string;
    }
  ): Promise<Customer> {
    const existing = await this.findByTelegramId(telegramId);
    if (existing) return existing;
    throw new Error('Customer not found and registration required');
  }
}
