export class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async getPaymentMethods(request, reply) {
        const result = await this.paymentService.getPaymentMethods();
        return reply.send({
            success: true,
            data: result
        });
    }
    async submitPaymentAdvice(request, reply) {
        const body = request.body;
        const customerId = request.user?.customerId;
        const result = await this.paymentService.submitPaymentAdvice({
            ...body,
            customerId
        });
        return reply.status(201).send({
            success: true,
            data: result
        });
    }
    async verifyPayment(request, reply) {
        const { id } = request.params;
        const body = request.body;
        const adminId = request.user?.telegramId;
        const result = await this.paymentService.verifyPayment(id, adminId, body.status, body.rejectionReason);
        return reply.send({
            success: true,
            data: result
        });
    }
}
