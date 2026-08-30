import prisma from '../lib/prisma.js';
export class SupportController {
    async createRequest(request, reply) {
        const user = request.user;
        const body = request.body;
        const customer = await prisma.customer.findUnique({
            where: { userId: user.customerId }
        });
        if (!customer) {
            return reply.status(404).send({ success: false, error: { code: 'CUSTOMER_NOT_FOUND' } });
        }
        const support = await prisma.supportRequest.create({
            data: {
                customerId: customer.id,
                category: body.category || 'GENERAL',
                message: body.message,
                orderId: body.orderId,
                status: 'OPEN'
            }
        });
        return reply.status(201).send({ success: true, data: support });
    }
    async getMyRequests(request, reply) {
        const user = request.user;
        const customer = await prisma.customer.findUnique({
            where: { userId: user.customerId }
        });
        if (!customer)
            return reply.send({ success: true, data: [] });
        const requests = await prisma.supportRequest.findMany({
            where: { customerId: customer.id },
            orderBy: { createdAt: 'desc' }
        });
        return reply.send({ success: true, data: requests });
    }
}
