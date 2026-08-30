import prisma from '../lib/prisma.js';
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
export class ReportController {
    // ==================== SALES REPORT ====================
    async getSalesReport(request, reply) {
        const { startDate, endDate, groupBy } = request.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: start, lte: end },
                status: { in: ['COMPLETED', 'DELIVERED', 'PAYMENT_CONFIRMED'] }
            },
            include: {
                customer: { include: { user: true } },
                group: { include: { kirchaType: true } }
            }
        });
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        let groupedData = [];
        if (groupBy === 'daily') {
            const groups = {};
            for (const order of orders) {
                const key = order.createdAt.toISOString().split('T')[0];
                if (!groups[key]) {
                    groups[key] = { date: key, orders: 0, revenue: 0 };
                }
                groups[key].orders++;
                groups[key].revenue += order.totalAmount;
            }
            groupedData = Object.values(groups);
        }
        else if (groupBy === 'weekly') {
            const groups = {};
            for (const order of orders) {
                const week = getWeekNumber(order.createdAt);
                const key = `${order.createdAt.getFullYear()}-W${week}`;
                if (!groups[key]) {
                    groups[key] = { week: key, orders: 0, revenue: 0 };
                }
                groups[key].orders++;
                groups[key].revenue += order.totalAmount;
            }
            groupedData = Object.values(groups);
        }
        else {
            const groups = {};
            for (const order of orders) {
                const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
                if (!groups[key]) {
                    groups[key] = { month: key, orders: 0, revenue: 0 };
                }
                groups[key].orders++;
                groups[key].revenue += order.totalAmount;
            }
            groupedData = Object.values(groups);
        }
        const revenueByType = {};
        for (const order of orders) {
            const typeName = order.group?.kirchaType?.nameEn || 'Unknown';
            if (!revenueByType[typeName]) {
                revenueByType[typeName] = { name: typeName, revenue: 0, orders: 0 };
            }
            revenueByType[typeName].revenue += order.totalAmount;
            revenueByType[typeName].orders++;
        }
        return reply.send({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalOrders,
                    averageOrderValue,
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                },
                groupedData,
                revenueByType: Object.values(revenueByType),
                recentOrders: orders.slice(0, 20)
            }
        });
    }
    // ==================== ORDER REPORT ====================
    async getOrderReport(request, reply) {
        const { status, customerId, startDate, endDate } = request.query;
        const where = {};
        if (status)
            where.status = status;
        if (customerId)
            where.customerId = customerId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const orders = await prisma.order.findMany({
            where,
            include: {
                customer: { include: { user: true } },
                group: { include: { kirchaType: true } },
                payment: true,
                delivery: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return reply.send({ success: true, data: orders });
    }
    // ==================== PAYMENT REPORT ====================
    async getPaymentReport(request, reply) {
        const { status, startDate, endDate } = request.query;
        const where = {};
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const payments = await prisma.payment.findMany({
            where,
            include: {
                order: {
                    include: {
                        customer: { include: { user: true } },
                        group: { include: { kirchaType: true } }
                    }
                },
                paymentMethod: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const summary = {
            totalPaid: payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0),
            totalPending: payments.filter(p => p.status === 'VERIFICATION').reduce((s, p) => s + p.amount, 0),
            totalRejected: payments.filter(p => p.status === 'REJECTED').reduce((s, p) => s + p.amount, 0),
            countPaid: payments.filter(p => p.status === 'PAID').length,
            countPending: payments.filter(p => p.status === 'VERIFICATION').length,
            countRejected: payments.filter(p => p.status === 'REJECTED').length,
        };
        return reply.send({
            success: true,
            data: { summary, payments }
        });
    }
    // ==================== DELIVERY REPORT ====================
    async getDeliveryReport(request, reply) {
        const { status, startDate, endDate } = request.query;
        const where = {};
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const deliveries = await prisma.delivery.findMany({
            where,
            include: {
                order: {
                    include: {
                        customer: { include: { user: true } },
                        deliveryAddress: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const summary = {
            totalDeliveries: deliveries.length,
            completed: deliveries.filter(d => d.status === 'DELIVERED').length,
            pending: deliveries.filter(d => d.status === 'ASSIGNED' || d.status === 'PICKED_UP').length,
            outForDelivery: deliveries.filter(d => d.status === 'OUT_FOR_DELIVERY').length,
            failed: deliveries.filter(d => d.status === 'FAILED').length,
        };
        return reply.send({
            success: true,
            data: { summary, deliveries }
        });
    }
    // ==================== CUSTOMER REPORT ====================
    async getCustomerReport(request, reply) {
        const { status, startDate, endDate } = request.query;
        const where = {};
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.registrationDate = {};
            if (startDate)
                where.registrationDate.gte = new Date(startDate);
            if (endDate)
                where.registrationDate.lte = new Date(endDate);
        }
        const customers = await prisma.customer.findMany({
            where,
            include: {
                user: true,
                orders: {
                    include: { payment: true }
                },
                groupMemberships: {
                    include: { group: { include: { kirchaType: true } } }
                }
            },
            orderBy: { registrationDate: 'desc' }
        });
        const enriched = customers.map(c => ({
            ...c,
            totalOrders: c.orders.length,
            totalSpent: c.orders.reduce((s, o) => s + o.totalAmount, 0),
            groupsJoined: c.groupMemberships.length,
            lastOrder: c.orders.length > 0 ? c.orders[0].createdAt : null
        }));
        return reply.send({ success: true, data: enriched });
    }
    // ==================== KIRCHA GROUP REPORT ====================
    async getGroupReport(request, reply) {
        const { status, startDate, endDate } = request.query;
        const where = {};
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const groups = await prisma.kirchaGroup.findMany({
            where,
            include: {
                kirchaType: true,
                memberships: {
                    include: { customer: { include: { user: true } } }
                },
                orders: {
                    include: { payment: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const enriched = groups.map(g => {
            const totalOrders = g.orders.length;
            const totalRevenue = g.orders.reduce((s, o) => s + o.totalAmount, 0);
            const occupancy = g.totalCapacity > 0
                ? ((g.reservedQuantity + g.soldQuantity) / g.totalCapacity * 100)
                : 0;
            return {
                ...g,
                totalOrders,
                totalRevenue,
                occupancy: Math.round(occupancy),
                memberCount: g.memberships.length
            };
        });
        return reply.send({ success: true, data: enriched });
    }
}
