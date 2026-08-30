import prisma from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';
import { storageService } from '../services/storageService.js';
export class PaymentAdviceController {
    async uploadAdvice(request, reply) {
        const user = request.user;
        const { paymentId, orderId } = request.body;
        // Get the uploaded file
        const file = await request.file();
        if (!file) {
            return reply.status(400).send({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
        }
        // Validate file
        const validation = await storageService.validateFile(file);
        if (!validation.valid) {
            return reply.status(400).send({ success: false, error: { code: 'INVALID_FILE', message: validation.error } });
        }
        // Read file buffer
        const buffer = await file.toBuffer();
        // Upload to storage
        const { key, url } = await storageService.uploadFile(buffer, file.mimetype);
        // Create advice record
        const advice = await prisma.paymentAdvice.create({
            data: {
                paymentId,
                customerId: user.customerId,
                storageKey: key,
                url: url,
                mimeType: file.mimetype,
                size: file.size,
                orderId: orderId || null,
                status: 'SUBMITTED'
            }
        });
        // Update payment status
        await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'VERIFICATION', adviceSubmittedAt: new Date() }
        });
        // Update order status
        if (orderId) {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAYMENT_REVIEW' }
            });
        }
        return reply.status(201).send({ success: true, data: advice });
    }
    async getAdvice(request, reply) {
        const { id } = request.params;
        const advice = await prisma.paymentAdvice.findUnique({
            where: { id },
            include: {
                payment: true,
                customer: { include: { user: true } }
            }
        });
        if (!advice)
            throw new NotFoundError('Payment advice');
        return reply.send({ success: true, data: advice });
    }
    async getAdviceByPayment(request, reply) {
        const { paymentId } = request.params;
        const advice = await prisma.paymentAdvice.findMany({
            where: { paymentId },
            orderBy: { uploadedAt: 'desc' }
        });
        return reply.send({ success: true, data: advice });
    }
}
