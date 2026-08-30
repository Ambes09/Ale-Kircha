import prisma from '../lib/prisma.js';
export class PaymentService {
    async getPaymentMethods() {
        return prisma.paymentMethod.findMany({
            where: { active: true },
            orderBy: { displayOrder: 'asc' }
        });
    }
    async submitPaymentAdvice(data) {
        return prisma.$transaction(async (tx) => {
            const advice = await tx.paymentAdvice.create({
                data: {
                    ...data,
                    status: 'SUBMITTED'
                }
            });
            await tx.payment.update({
                where: { id: data.paymentId },
                data: {
                    status: 'VERIFICATION',
                    adviceSubmittedAt: new Date()
                }
            });
            const payment = await tx.payment.findUnique({
                where: { id: data.paymentId }
            });
            if (payment?.orderId) {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: {
                        status: 'PAYMENT_REVIEW'
                    }
                });
            }
            return advice;
        });
    }
    async verifyPayment(paymentId, verifiedBy, status, rejectionReason) {
        return prisma.$transaction(async (tx) => {
            const payment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status,
                    verifiedAt: new Date(),
                    verifiedBy,
                    rejectionReason: rejectionReason || null
                }
            });
            if (status === 'PAID') {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: {
                        status: 'PAYMENT_CONFIRMED'
                    }
                });
            }
            else {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: {
                        status: 'CANCELLED'
                    }
                });
            }
            return payment;
        });
    }
}
