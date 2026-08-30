import prisma from '../lib/prisma.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
export class OrderService {
    async calculateFees(data) {
        // Get all active fee configurations
        const feeConfigs = await prisma.feeConfiguration.findMany({
            where: {
                isActive: true,
                OR: [
                    { applyTo: 'ALL' },
                    { applyTo: 'GROUP', applyToId: data.groupId },
                    { applyTo: 'CUSTOMER', applyToId: data.customerId }
                ]
            },
            orderBy: { priority: 'asc' }
        });
        // Get delivery zone
        let deliveryFee = 0;
        if (data.deliveryZone) {
            const zone = await prisma.deliveryZone.findFirst({
                where: {
                    nameEn: data.deliveryZone,
                    isActive: true,
                    minOrder: { lte: data.subtotal }
                },
                orderBy: { priority: 'asc' }
            });
            if (zone)
                deliveryFee = zone.fee;
        }
        let totalDiscount = 0;
        let discountType = 'FIXED';
        let discountDescription = '';
        let totalServiceCharge = 0;
        let serviceChargeType = 'FIXED';
        let serviceChargeDescription = '';
        let totalTax = 0;
        let taxRate = 0;
        // Apply fees in priority order
        for (const config of feeConfigs) {
            if (config.minValue && data.subtotal < config.minValue)
                continue;
            if (config.maxValue && data.subtotal > config.maxValue)
                continue;
            if (config.startDate && new Date() < config.startDate)
                continue;
            if (config.endDate && new Date() > config.endDate)
                continue;
            const value = config.value;
            let appliedValue = 0;
            if (config.valueType === 'PERCENTAGE') {
                appliedValue = (data.subtotal * value) / 100;
            }
            else {
                appliedValue = value;
            }
            switch (config.type) {
                case 'DISCOUNT':
                    totalDiscount += appliedValue;
                    discountType = config.valueType;
                    discountDescription = config.nameEn;
                    break;
                case 'SERVICE_CHARGE':
                    totalServiceCharge += appliedValue;
                    serviceChargeType = config.valueType;
                    serviceChargeDescription = config.nameEn;
                    break;
                case 'TAX':
                    totalTax += appliedValue;
                    taxRate = config.value;
                    break;
            }
        }
        const total = data.subtotal - totalDiscount + totalServiceCharge + deliveryFee + totalTax;
        return {
            subtotal: data.subtotal,
            discount: totalDiscount,
            discountType,
            discountDescription,
            serviceCharge: totalServiceCharge,
            serviceChargeType,
            serviceChargeDescription,
            deliveryFee,
            tax: totalTax,
            taxRate,
            total,
            feeBreakdown: feeConfigs.map(c => ({
                name: c.nameEn,
                type: c.type,
                value: c.value,
                valueType: c.valueType,
                applied: c.valueType === 'PERCENTAGE' ? (data.subtotal * c.value) / 100 : c.value
            }))
        };
    }
    async createOrder(data) {
        const orderNumber = generateOrderNumber();
        // Calculate subtotal
        const subtotal = data.quantity * data.unitPrice;
        // Calculate fees
        const feeResult = await this.calculateFees({
            subtotal,
            quantity: data.quantity,
            groupId: data.groupId,
            customerId: data.customerId,
            deliveryZone: data.deliveryZone
        });
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    ...data,
                    orderNumber,
                    subtotal: feeResult.subtotal,
                    discount: feeResult.discount,
                    discountType: feeResult.discountType,
                    discountDescription: feeResult.discountDescription,
                    serviceCharge: feeResult.serviceCharge,
                    serviceChargeType: feeResult.serviceChargeType,
                    serviceChargeDescription: feeResult.serviceChargeDescription,
                    deliveryFee: feeResult.deliveryFee,
                    tax: feeResult.tax,
                    taxRate: feeResult.taxRate,
                    additionalFees: 0,
                    totalAmount: feeResult.total,
                    status: 'DRAFT'
                },
                include: {
                    customer: {
                        include: {
                            user: true
                        }
                    },
                    group: true,
                    deliveryAddress: true,
                    paymentMethod: true
                }
            });
            await tx.payment.create({
                data: {
                    orderId: order.id,
                    amount: feeResult.total,
                    paymentMethodId: data.paymentMethodId || '',
                    status: 'UNPAID'
                }
            });
            return {
                order,
                feeBreakdown: feeResult.feeBreakdown
            };
        });
    }
    async getOrder(id) {
        return prisma.order.findUnique({
            where: { id },
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
                deliveryAddress: true,
                paymentMethod: true,
                payment: {
                    include: {
                        advices: true
                    }
                },
                delivery: true,
                paymentAdvice: true
            }
        });
    }
    async getOrdersByCustomer(customerId) {
        return prisma.order.findMany({
            where: { customerId },
            include: {
                group: {
                    include: {
                        kirchaType: true
                    }
                },
                payment: true,
                delivery: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async updateStatus(id, status) {
        const oldOrder = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: {
                    include: { user: true }
                }
            }
        });
        if (!oldOrder)
            throw new Error('Order not found');
        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                customer: {
                    include: { user: true }
                },
                group: {
                    include: { kirchaType: true }
                }
            }
        });
        return order;
    }
}
