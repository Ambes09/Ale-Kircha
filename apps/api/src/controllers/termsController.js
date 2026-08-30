import prisma from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';
export class TermsController {
    // ==================== PUBLIC ====================
    async getActiveTerms(request, reply) {
        const terms = await prisma.termsVersion.findFirst({
            where: { isActive: true },
            orderBy: { effectiveFrom: 'desc' }
        });
        return reply.send({ success: true, data: terms });
    }
    async getActivePrivacy(request, reply) {
        const privacy = await prisma.privacyPolicyVersion.findFirst({
            where: { isActive: true },
            orderBy: { effectiveFrom: 'desc' }
        });
        return reply.send({ success: true, data: privacy });
    }
    async getTermsById(request, reply) {
        const { id } = request.params;
        const terms = await prisma.termsVersion.findUnique({ where: { id } });
        if (!terms)
            throw new NotFoundError('Terms version');
        return reply.send({ success: true, data: terms });
    }
    async acceptTerms(request, reply) {
        const { termsVersionId, privacyVersionId, languageUsed } = request.body;
        const user = request.user;
        if (!user || !user.customerId) {
            return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED' } });
        }
        const acceptance = await prisma.userLegalAcceptance.create({
            data: {
                userId: user.customerId,
                termsVersionId,
                privacyVersionId,
                languageUsed: languageUsed || 'en',
                telegramUserId: user.telegramId,
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
                acceptedAt: new Date()
            }
        });
        return reply.status(201).send({ success: true, data: acceptance });
    }
    async getAcceptanceStatus(request, reply) {
        const user = request.user;
        if (!user || !user.customerId) {
            return reply.send({ success: true, data: { hasAccepted: false } });
        }
        const acceptance = await prisma.userLegalAcceptance.findFirst({
            where: {
                userId: user.customerId,
                termsVersion: { isActive: true },
                privacyVersion: { isActive: true }
            },
            orderBy: { acceptedAt: 'desc' }
        });
        return reply.send({
            success: true,
            data: {
                hasAccepted: !!acceptance,
                acceptance: acceptance
            }
        });
    }
}
