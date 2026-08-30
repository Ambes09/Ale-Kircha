import { NotFoundError } from '../errors/index.js';
export class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async createOrder(request, reply) {
        const body = request.body;
        const customerId = request.user?.customerId;
        const result = await this.orderService.createOrder({
            ...body,
            customerId
        });
        return reply.status(201).send({
            success: true,
            data: result
        });
    }
    async getOrder(request, reply) {
        const { id } = request.params;
        const result = await this.orderService.getOrder(id);
        return reply.send({
            success: true,
            data: result
        });
    }
    async getMyOrders(request, reply) {
        const customerId = request.user?.customerId;
        const result = await this.orderService.getOrdersByCustomer(customerId);
        return reply.send({
            success: true,
            data: result
        });
    }
    async updateStatus(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const result = await this.orderService.updateStatus(id, body.status);
        return reply.send({
            success: true,
            data: result
        });
    }
    async cancelOrder(request, reply) {
        const { id } = request.params;
        const user = request.user;
        const order = await this.orderService.getOrder(id);
        if (!order)
            throw new NotFoundError('Order');
        // Check if order belongs to user
        const customer = await (await import('../lib/prisma.js')).default.customer.findUnique({
            where: { userId: user.customerId }
        });
        if (order.customerId !== customer?.id) {
            return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN' } });
        }
        if (order.status !== 'DRAFT' && order.status !== 'PENDING_PAYMENT') {
            return reply.status(400).send({
                success: false,
                error: { code: 'CANNOT_CANCEL', message: 'Order cannot be cancelled at this stage' }
            });
        }
        const updated = await this.orderService.updateStatus(id, 'CANCELLED');
        return reply.send({ success: true, data: updated });
    }
    async trackOrder(request, reply) {
        const { id } = request.params;
        const user = request.user;
        const order = await this.orderService.getOrder(id);
        if (!order)
            throw new NotFoundError('Order');
        const customer = await (await import('../lib/prisma.js')).default.customer.findUnique({
            where: { userId: user.customerId }
        });
        if (order.customerId !== customer?.id) {
            return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN' } });
        }
        // Build tracking timeline
        const timeline = [];
        const statuses = ['DRAFT', 'PENDING_PAYMENT', 'PAYMENT_REVIEW', 'PAYMENT_CONFIRMED',
            'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];
        let currentIndex = statuses.indexOf(order.status);
        for (let i = 0; i <= currentIndex; i++) {
            const status = statuses[i];
            let date = order.createdAt;
            if (i === currentIndex && order.updatedAt)
                date = order.updatedAt;
            if (status === 'PAYMENT_CONFIRMED' && order.payment?.verifiedAt)
                date = order.payment.verifiedAt;
            if (status === 'OUT_FOR_DELIVERY' && order.delivery?.outForDeliveryAt)
                date = order.delivery.outForDeliveryAt;
            if (status === 'DELIVERED' && order.delivery?.deliveredAt)
                date = order.delivery.deliveredAt;
            timeline.push({
                status,
                date,
                isCurrent: i === currentIndex,
                isCompleted: i < currentIndex
            });
        }
        return reply.send({
            success: true,
            data: {
                order,
                timeline,
                currentStatus: order.status,
                progress: Math.round((currentIndex / (statuses.length - 1)) * 100)
            }
        });
    }
}
