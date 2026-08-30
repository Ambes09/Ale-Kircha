export class KirchaGroupRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAvailable() {
        return this.prisma.kirchaGroup.findMany({
            where: {
                status: 'OPEN',
                totalCapacity: {
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
    async findById(id) {
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
    async create(data) {
        return this.prisma.kirchaGroup.create({
            data,
            include: {
                kirchaType: true
            }
        });
    }
    async update(id, data) {
        return this.prisma.kirchaGroup.update({
            where: { id },
            data,
            include: {
                kirchaType: true
            }
        });
    }
    async updateStatus(id, status) {
        return this.prisma.kirchaGroup.update({
            where: { id },
            data: { status }
        });
    }
}
