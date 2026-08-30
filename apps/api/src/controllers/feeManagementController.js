import prisma from '../lib/prisma.js';
export class FeeManagementController {
    // ==================== SERVICE CHARGES ====================
    async getServiceCharges(request, reply) {
        const charges = await prisma.serviceCharge.findMany({
            where: { isActive: true },
            orderBy: { priority: 'asc' }
        });
        return reply.send({ success: true, data: charges });
    }
    async createServiceCharge(request, reply) {
        const body = request.body;
        const charge = await prisma.serviceCharge.create({
            data: {
                nameEn: body.nameEn,
                nameAm: body.nameAm || body.nameEn,
                type: body.type || 'FIXED',
                value: body.value || 0,
                descriptionEn: body.descriptionEn,
                descriptionAm: body.descriptionAm,
                applyTo: body.applyTo || 'ALL',
                applyToId: body.applyToId,
                isActive: body.isActive !== undefined ? body.isActive : true,
                priority: body.priority || 0
            }
        });
        return reply.status(201).send({ success: true, data: charge });
    }
    async updateServiceCharge(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const charge = await prisma.serviceCharge.update({
            where: { id },
            data: body
        });
        return reply.send({ success: true, data: charge });
    }
    async deleteServiceCharge(request, reply) {
        const { id } = request.params;
        await prisma.serviceCharge.delete({ where: { id } });
        return reply.send({ success: true });
    }
    // ==================== DELIVERY CHARGES ====================
    async getDeliveryCharges(request, reply) {
        const charges = await prisma.deliveryCharge.findMany({
            where: { isActive: true },
            include: { zone: true },
            orderBy: { priority: 'asc' }
        });
        return reply.send({ success: true, data: charges });
    }
    async createDeliveryCharge(request, reply) {
        const body = request.body;
        const charge = await prisma.deliveryCharge.create({
            data: {
                zoneId: body.zoneId,
                baseFee: body.baseFee || 0,
                perKmFee: body.perKmFee || 0,
                perKgFee: body.perKgFee || 0,
                minimumOrder: body.minimumOrder || 0,
                maximumOrder: body.maximumOrder,
                weightRangeStart: body.weightRangeStart,
                weightRangeEnd: body.weightRangeEnd,
                distanceRangeStart: body.distanceRangeStart,
                distanceRangeEnd: body.distanceRangeEnd,
                isActive: body.isActive !== undefined ? body.isActive : true,
                priority: body.priority || 0
            },
            include: { zone: true }
        });
        return reply.status(201).send({ success: true, data: charge });
    }
    async updateDeliveryCharge(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const charge = await prisma.deliveryCharge.update({
            where: { id },
            data: body,
            include: { zone: true }
        });
        return reply.send({ success: true, data: charge });
    }
    async deleteDeliveryCharge(request, reply) {
        const { id } = request.params;
        await prisma.deliveryCharge.delete({ where: { id } });
        return reply.send({ success: true });
    }
    // ==================== TAX CONFIGURATION ====================
    async getTaxConfigs(request, reply) {
        const taxes = await prisma.feeConfiguration.findMany({
            where: { type: 'TAX', isActive: true },
            orderBy: { priority: 'asc' }
        });
        return reply.send({ success: true, data: taxes });
    }
    async createTaxConfig(request, reply) {
        const body = request.body;
        const user = request.user;
        const tax = await prisma.feeConfiguration.create({
            data: {
                key: `tax_${Date.now()}`,
                type: 'TAX',
                nameEn: body.nameEn,
                nameAm: body.nameAm || body.nameEn,
                valueType: 'PERCENTAGE',
                value: body.value || 0,
                isActive: body.isActive !== undefined ? body.isActive : true,
                priority: body.priority || 0,
                applyTo: 'ALL',
                createdBy: user?.telegramId || 'system'
            }
        });
        return reply.status(201).send({ success: true, data: tax });
    }
    async updateTaxConfig(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const tax = await prisma.feeConfiguration.update({
            where: { id },
            data: body
        });
        return reply.send({ success: true, data: tax });
    }
    async deleteTaxConfig(request, reply) {
        const { id } = request.params;
        await prisma.feeConfiguration.delete({ where: { id } });
        return reply.send({ success: true });
    }
    // ==================== FEE CALCULATION ENGINE ====================
    async calculateTotalFees(request, reply) {
        const { subtotal, quantity, weight, distance, zoneId, customerId, groupId } = request.body;
        // 1. Get all active discounts
        const discounts = await prisma.feeConfiguration.findMany({
            where: {
                type: 'DISCOUNT',
                isActive: true,
                OR: [
                    { applyTo: 'ALL' },
                    { applyTo: 'CUSTOMER', applyToId: customerId },
                    { applyTo: 'GROUP', applyToId: groupId }
                ]
            },
            orderBy: { priority: 'asc' }
        });
        // 2. Get service charges
        const serviceCharges = await prisma.serviceCharge.findMany({
            where: {
                isActive: true,
                OR: [
                    { applyTo: 'ALL' },
                    { applyTo: 'CUSTOMER', applyToId: customerId }
                ]
            },
            orderBy: { priority: 'asc' }
        });
        // 3. Get delivery charges
        let deliveryCharge = { baseFee: 0, perKmFee: 0, perKgFee: 0 };
        if (zoneId) {
            const charge = await prisma.deliveryCharge.findFirst({
                where: {
                    zoneId,
                    isActive: true,
                    minimumOrder: { lte: subtotal }
                },
                orderBy: { priority: 'asc' }
            });
            if (charge) {
                deliveryCharge = charge;
            }
        }
        // 4. Get tax configuration
        const taxConfig = await prisma.feeConfiguration.findFirst({
            where: {
                type: 'TAX',
                isActive: true
            },
            orderBy: { priority: 'asc' }
        });
        // Calculate fees
        let totalDiscount = 0;
        let discountBreakdown = [];
        let totalServiceCharge = 0;
        let serviceChargeBreakdown = [];
        // Calculate discounts
        for (const discount of discounts) {
            const value = discount.value;
            let applied = 0;
            if (discount.valueType === 'PERCENTAGE') {
                applied = (subtotal * value) / 100;
            }
            else {
                applied = value;
            }
            totalDiscount += applied;
            discountBreakdown.push({
                name: discount.nameEn,
                type: discount.valueType,
                value: discount.value,
                applied
            });
        }
        // Calculate service charges
        for (const charge of serviceCharges) {
            let applied = 0;
            if (charge.type === 'PERCENTAGE') {
                applied = (subtotal * charge.value) / 100;
            }
            else if (charge.type === 'PER_UNIT') {
                applied = charge.value * (quantity || 1);
            }
            else {
                applied = charge.value;
            }
            totalServiceCharge += applied;
            serviceChargeBreakdown.push({
                name: charge.nameEn,
                type: charge.type,
                value: charge.value,
                applied
            });
        }
        // Calculate delivery fee
        let totalDeliveryFee = deliveryCharge.baseFee || 0;
        if (deliveryCharge.perKmFee && distance) {
            totalDeliveryFee += deliveryCharge.perKmFee * distance;
        }
        if (deliveryCharge.perKgFee && weight) {
            totalDeliveryFee += deliveryCharge.perKgFee * weight;
        }
        // Calculate tax
        let taxRate = 0;
        let taxAmount = 0;
        if (taxConfig) {
            taxRate = taxConfig.value;
            const taxableAmount = subtotal - totalDiscount + totalServiceCharge + totalDeliveryFee;
            taxAmount = (taxableAmount * taxRate) / 100;
        }
        // Calculate total
        const total = subtotal - totalDiscount + totalServiceCharge + totalDeliveryFee + taxAmount;
        return reply.send({
            success: true,
            data: {
                subtotal,
                discounts: {
                    total: totalDiscount,
                    breakdown: discountBreakdown
                },
                serviceCharges: {
                    total: totalServiceCharge,
                    breakdown: serviceChargeBreakdown
                },
                deliveryFee: totalDeliveryFee,
                tax: {
                    rate: taxRate,
                    amount: taxAmount
                },
                total
            }
        });
    }
}
