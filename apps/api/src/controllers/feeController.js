import prisma from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';
export class FeeController {
    // ==================== FEE CONFIGURATIONS ====================
    async getFeeConfigs(request, reply) {
        const { type, active } = request.query;
        const where = {};
        if (type)
            where.type = type;
        if (active !== undefined)
            where.isActive = active === 'true';
        const configs = await prisma.feeConfiguration.findMany({
            where,
            orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }]
        });
        return reply.send({ success: true, data: configs });
    }
    async getFeeConfig(request, reply) {
        const { id } = request.params;
        const config = await prisma.feeConfiguration.findUnique({ where: { id } });
        if (!config)
            throw new NotFoundError('Fee configuration');
        return reply.send({ success: true, data: config });
    }
    async createFeeConfig(request, reply) {
        const body = request.body;
        const user = request.user;
        const config = await prisma.feeConfiguration.create({
            data: {
                key: body.key || `${body.type}_${Date.now()}`,
                type: body.type,
                nameEn: body.nameEn,
                nameAm: body.nameAm || body.nameEn,
                descriptionEn: body.descriptionEn,
                descriptionAm: body.descriptionAm,
                valueType: body.valueType || 'FIXED',
                value: body.value || 0,
                minValue: body.minValue,
                maxValue: body.maxValue,
                isActive: body.isActive !== undefined ? body.isActive : true,
                priority: body.priority || 0,
                applyTo: body.applyTo || 'ALL',
                applyToId: body.applyToId,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                createdBy: user?.telegramId || 'system'
            }
        });
        return reply.status(201).send({ success: true, data: config });
    }
    async updateFeeConfig(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const config = await prisma.feeConfiguration.update({
            where: { id },
            data: body
        });
        return reply.send({ success: true, data: config });
    }
    async deleteFeeConfig(request, reply) {
        const { id } = request.params;
        await prisma.feeConfiguration.delete({ where: { id } });
        return reply.send({ success: true });
    }
    // ==================== DELIVERY ZONES ====================
    async getDeliveryZones(request, reply) {
        const zones = await prisma.deliveryZone.findMany({
            where: { isActive: true },
            orderBy: { priority: 'asc' }
        });
        return reply.send({ success: true, data: zones });
    }
    async createDeliveryZone(request, reply) {
        const body = request.body;
        const zone = await prisma.deliveryZone.create({
            data: {
                nameEn: body.nameEn,
                nameAm: body.nameAm || body.nameEn,
                fee: body.fee || 0,
                minOrder: body.minOrder || 0,
                maxOrder: body.maxOrder,
                isActive: body.isActive !== undefined ? body.isActive : true,
                priority: body.priority || 0
            }
        });
        return reply.status(201).send({ success: true, data: zone });
    }
    async updateDeliveryZone(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const zone = await prisma.deliveryZone.update({
            where: { id },
            data: body
        });
        return reply.send({ success: true, data: zone });
    }
    async deleteDeliveryZone(request, reply) {
        const { id } = request.params;
        await prisma.deliveryZone.delete({ where: { id } });
        return reply.send({ success: true });
    }
    // ==================== FEE SUMMARY ====================
    async getFeeSummary(request, reply) {
        const [discounts, serviceCharges, taxes, deliveryZones] = await Promise.all([
            prisma.feeConfiguration.count({ where: { type: 'DISCOUNT', isActive: true } }),
            prisma.feeConfiguration.count({ where: { type: 'SERVICE_CHARGE', isActive: true } }),
            prisma.feeConfiguration.count({ where: { type: 'TAX', isActive: true } }),
            prisma.deliveryZone.count({ where: { isActive: true } })
        ]);
        return reply.send({
            success: true,
            data: {
                activeDiscounts: discounts,
                activeServiceCharges: serviceCharges,
                activeTaxes: taxes,
                activeDeliveryZones: deliveryZones
            }
        });
    }
    // ==================== CALCULATE ORDER FEES (FIXED) ====================
    async calculateOrderFees(request, reply) {
        try {
            const { subtotal, quantity, groupId, customerId, deliveryZone } = request.body;
            if (!subtotal || subtotal <= 0) {
                return reply.status(400).send({
                    success: false,
                    error: { code: 'INVALID_SUBTOTAL', message: 'Valid subtotal is required' }
                });
            }
            // Get all active fee configurations
            const feeConfigs = await prisma.feeConfiguration.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { applyTo: 'ALL' },
                        { applyTo: 'GROUP', applyToId: groupId },
                        { applyTo: 'CUSTOMER', applyToId: customerId }
                    ]
                },
                orderBy: { priority: 'asc' }
            });
            // Get delivery fee
            let deliveryFee = 0;
            if (deliveryZone) {
                const zone = await prisma.deliveryZone.findFirst({
                    where: {
                        nameEn: deliveryZone,
                        isActive: true,
                        minOrder: { lte: subtotal }
                    },
                    orderBy: { priority: 'asc' }
                });
                if (zone)
                    deliveryFee = zone.fee;
            }
            let totalDiscount = 0;
            let totalServiceCharge = 0;
            let totalTax = 0;
            const breakdown = [];
            // Apply fees in priority order
            for (const config of feeConfigs) {
                if (config.minValue && subtotal < config.minValue)
                    continue;
                if (config.maxValue && subtotal > config.maxValue)
                    continue;
                if (config.startDate && new Date() < config.startDate)
                    continue;
                if (config.endDate && new Date() > config.endDate)
                    continue;
                const value = config.value;
                let appliedValue = 0;
                if (config.valueType === 'PERCENTAGE') {
                    appliedValue = (subtotal * value) / 100;
                }
                else {
                    appliedValue = value;
                }
                switch (config.type) {
                    case 'DISCOUNT':
                        totalDiscount += appliedValue;
                        break;
                    case 'SERVICE_CHARGE':
                        totalServiceCharge += appliedValue;
                        break;
                    case 'TAX':
                        totalTax += appliedValue;
                        break;
                }
                breakdown.push({
                    name: config.nameEn,
                    type: config.type,
                    value: config.value,
                    valueType: config.valueType,
                    applied: appliedValue
                });
            }
            // Calculate final total
            const total = subtotal - totalDiscount + totalServiceCharge + deliveryFee + totalTax;
            return reply.send({
                success: true,
                data: {
                    subtotal,
                    discount: totalDiscount,
                    serviceCharge: totalServiceCharge,
                    deliveryFee,
                    tax: totalTax,
                    total,
                    breakdown
                }
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                error: { code: 'CALCULATION_ERROR', message: error.message }
            });
        }
    }
}
