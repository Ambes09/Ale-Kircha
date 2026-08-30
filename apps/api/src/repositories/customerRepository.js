export class CustomerRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByTelegramId(telegramId) {
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
    async findById(id) {
        return this.prisma.customer.findUnique({
            where: { id },
            include: {
                user: true,
                addresses: true
            }
        });
    }
    async create(data) {
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
    async update(id, data) {
        return this.prisma.customer.update({
            where: { id },
            data,
            include: {
                user: true,
                addresses: true
            }
        });
    }
    async findOrCreateByTelegram(telegramId, userData) {
        const existing = await this.findByTelegramId(telegramId);
        if (existing)
            return existing;
        throw new Error('Customer not found and registration required');
    }
}
