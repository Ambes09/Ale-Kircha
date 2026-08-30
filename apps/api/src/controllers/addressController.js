import prisma from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';
export class AddressController {
    async getAddresses(request, reply) {
        const user = request.user;
        const customer = await prisma.customer.findUnique({
            where: { userId: user.customerId }
        });
        if (!customer)
            throw new NotFoundError('Customer');
        const addresses = await prisma.customerAddress.findMany({
            where: { customerId: customer.id },
            orderBy: { isDefault: 'desc' }
        });
        return reply.send({ success: true, data: addresses });
    }
    async createAddress(request, reply) {
        const user = request.user;
        const body = request.body;
        const customer = await prisma.customer.findUnique({
            where: { userId: user.customerId }
        });
        if (!customer)
            throw new NotFoundError('Customer');
        const address = await prisma.customerAddress.create({
            data: {
                ...body,
                customerId: customer.id
            }
        });
        return reply.status(201).send({ success: true, data: address });
    }
    async updateAddress(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const address = await prisma.customerAddress.update({
            where: { id },
            data: body
        });
        return reply.send({ success: true, data: address });
    }
    async deleteAddress(request, reply) {
        const { id } = request.params;
        await prisma.customerAddress.delete({ where: { id } });
        return reply.send({ success: true });
    }
    async setDefaultAddress(request, reply) {
        const { id } = request.params;
        const user = request.user;
        const customer = await prisma.customer.findUnique({
            where: { userId: user.customerId }
        });
        if (!customer)
            throw new NotFoundError('Customer');
        await prisma.customerAddress.updateMany({
            where: { customerId: customer.id, isDefault: true },
            data: { isDefault: false }
        });
        const address = await prisma.customerAddress.update({
            where: { id },
            data: { isDefault: true }
        });
        return reply.send({ success: true, data: address });
    }
}
