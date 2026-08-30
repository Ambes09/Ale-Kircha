export class CustomerController {
    constructor(customerService) {
        this.customerService = customerService;
    }
    async register(request, reply) {
        const body = request.body;
        const result = await this.customerService.register(body);
        return reply.status(201).send({
            success: true,
            data: result
        });
    }
    async profile(request, reply) {
        const telegramId = request.user?.telegramId;
        const result = await this.customerService.getProfile(telegramId);
        return reply.send({
            success: true,
            data: result
        });
    }
    async updateProfile(request, reply) {
        const telegramId = request.user?.telegramId;
        const body = request.body;
        const result = await this.customerService.updateProfile(telegramId, body);
        return reply.send({
            success: true,
            data: result
        });
    }
    async getAllCustomers(request, reply) {
        const prisma = request.server?.prisma || (await import('../lib/prisma.js')).default;
        const customers = await prisma.customer.findMany({
            include: {
                user: true,
                addresses: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return reply.send({
            success: true,
            data: customers
        });
    }
}
