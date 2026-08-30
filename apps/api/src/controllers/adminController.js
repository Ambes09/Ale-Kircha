import prisma from '../lib/prisma.js';
export class AdminController {
    // ==================== STATS ====================
    async getStats(request, reply) {
        try {
            const [pendingPayments, pendingOrders, activeGroups, totalCustomers, bannedCount] = await Promise.all([
                prisma.payment.count({ where: { status: 'VERIFICATION' } }),
                prisma.order.count({ where: { status: { in: ['DRAFT', 'PENDING_PAYMENT', 'PAYMENT_REVIEW'] } } }),
                prisma.kirchaGroup.count({ where: { status: 'OPEN' } }),
                prisma.customer.count(),
                prisma.bannedUser.count({ where: { active: true } }),
            ]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const payments = await prisma.payment.findMany({
                where: {
                    status: 'PAID',
                    verifiedAt: {
                        gte: today,
                    },
                },
                select: { amount: true },
            });
            const todayRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
            return reply.send({
                success: true,
                data: {
                    pendingPayments,
                    pendingOrders,
                    activeGroups,
                    totalCustomers,
                    bannedCount,
                    todayRevenue,
                },
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error.message,
                },
            });
        }
    }
    async checkAdmin(request, reply) {
        const { telegramId } = request.body;
        const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());
        const isAdmin = adminIds.includes(telegramId);
        let isDbAdmin = false;
        try {
            const user = await prisma.user.findFirst({
                where: {
                    telegramId: telegramId,
                    role: {
                        in: ['ADMIN', 'SUPER_ADMIN']
                    }
                }
            });
            isDbAdmin = !!user;
        }
        catch (error) { }
        return reply.send({
            success: true,
            data: {
                isAdmin: isAdmin || isDbAdmin,
                isSuperAdmin: isAdmin,
            },
        });
    }
    async getAllOrders(request, reply) {
        try {
            const orders = await prisma.order.findMany({
                include: {
                    customer: {
                        include: {
                            user: true
                        }
                    },
                    group: {
                        include: {
                            kirchaType: true
                        }
                    },
                    payment: true,
                    delivery: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 50,
            });
            return reply.send({
                success: true,
                data: orders,
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error.message,
                },
            });
        }
    }
    // ==================== USER BAN MANAGEMENT ====================
    async banUser(request, reply) {
        const { telegramId, reason, duration } = request.body;
        const admin = request.user;
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { telegramId },
            include: { customer: true }
        });
        if (!user) {
            return reply.status(404).send({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }
        // Check if already banned
        const existingBan = await prisma.bannedUser.findUnique({
            where: { telegramId }
        });
        if (existingBan && existingBan.active) {
            return reply.status(400).send({
                success: false,
                error: { code: 'ALREADY_BANNED', message: 'User is already banned' }
            });
        }
        const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        const ban = await prisma.bannedUser.upsert({
            where: { telegramId },
            update: {
                reason: reason || 'No reason provided',
                bannedBy: admin?.telegramId || 'system',
                bannedAt: new Date(),
                expiresAt,
                active: true,
                notes: reason || 'No reason provided'
            },
            create: {
                telegramId,
                reason: reason || 'No reason provided',
                bannedBy: admin?.telegramId || 'system',
                expiresAt,
                active: true,
                notes: reason || 'No reason provided'
            }
        });
        // Also update customer status if exists
        if (user.customer) {
            await prisma.customer.update({
                where: { id: user.customer.id },
                data: { status: 'BLOCKED' }
            });
        }
        return reply.send({
            success: true,
            data: ban,
            message: `User ${telegramId} has been banned`
        });
    }
    async unbanUser(request, reply) {
        const { telegramId } = request.params;
        const ban = await prisma.bannedUser.findUnique({
            where: { telegramId }
        });
        if (!ban || !ban.active) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_BANNED', message: 'User is not banned' }
            });
        }
        await prisma.bannedUser.update({
            where: { telegramId },
            data: { active: false }
        });
        // Update customer status
        const user = await prisma.user.findUnique({
            where: { telegramId },
            include: { customer: true }
        });
        if (user?.customer) {
            await prisma.customer.update({
                where: { id: user.customer.id },
                data: { status: 'ACTIVE' }
            });
        }
        return reply.send({
            success: true,
            message: `User ${telegramId} has been unbanned`
        });
    }
    async getBannedUsers(request, reply) {
        const bans = await prisma.bannedUser.findMany({
            where: { active: true },
            orderBy: { bannedAt: 'desc' }
        });
        return reply.send({
            success: true,
            data: bans
        });
    }
    async checkUserBanned(telegramId) {
        const ban = await prisma.bannedUser.findUnique({
            where: { telegramId }
        });
        if (!ban || !ban.active)
            return false;
        if (ban.expiresAt && ban.expiresAt < new Date()) {
            // Ban expired
            await prisma.bannedUser.update({
                where: { telegramId },
                data: { active: false }
            });
            return false;
        }
        return true;
    }
    // ==================== BULK MESSAGES ====================
    async sendBulkMessage(request, reply) {
        const { target, targetId, title, message } = request.body;
        const admin = request.user;
        // Get target customers
        let customers = [];
        if (target === 'all') {
            customers = await prisma.customer.findMany({
                include: { user: true }
            });
        }
        else if (target === 'group' && targetId) {
            const memberships = await prisma.kirchaGroupMembership.findMany({
                where: { groupId: targetId },
                include: { customer: { include: { user: true } } }
            });
            customers = memberships.map(m => m.customer);
        }
        else if (target === 'specific') {
            // For specific users, we handle via user IDs
            const userIds = request.body.userIds || [];
            customers = await prisma.customer.findMany({
                where: { userId: { in: userIds } },
                include: { user: true }
            });
        }
        // Create bulk message record
        const bulkMessage = await prisma.bulkMessage.create({
            data: {
                title,
                message,
                target,
                targetId: targetId || '',
                sentBy: admin?.telegramId || 'system',
                status: 'PENDING'
            }
        });
        // Create recipient records
        const recipients = customers.map(customer => ({
            messageId: bulkMessage.id,
            customerId: customer.id,
            status: 'PENDING'
        }));
        if (recipients.length > 0) {
            await prisma.bulkMessageRecipient.createMany({
                data: recipients
            });
        }
        await prisma.bulkMessage.update({
            where: { id: bulkMessage.id },
            data: {
                deliveredCount: recipients.length,
                status: 'SENT'
            }
        });
        return reply.send({
            success: true,
            data: {
                messageId: bulkMessage.id,
                totalRecipients: recipients.length,
                message: `Bulk message sent to ${recipients.length} users`
            }
        });
    }
    async getBulkMessages(request, reply) {
        const messages = await prisma.bulkMessage.findMany({
            orderBy: { sentAt: 'desc' },
            take: 20
        });
        return reply.send({
            success: true,
            data: messages
        });
    }
}
