import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';

export class TermsController {
  // ==================== PUBLIC ====================
  
  async getActiveTerms(request: FastifyRequest, reply: FastifyReply) {
    const terms = await prisma.termsVersion.findFirst({
      where: { isCurrent: true },
      orderBy: { effectiveDate: 'desc' }
    });
    return reply.send({ success: true, data: terms });
  }

  async getActivePrivacy(request: FastifyRequest, reply: FastifyReply) {
    const privacy = await prisma.privacyPolicyVersion.findFirst({
      where: { isCurrent: true },
      orderBy: { effectiveDate: 'desc' }
    });
    return reply.send({ success: true, data: privacy });
  }

  async getTermsById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const terms = await prisma.termsVersion.findUnique({ where: { id } });
    if (!terms) throw new NotFoundError('Terms version');
    return reply.send({ success: true, data: terms });
  }

  async acceptTerms(request: FastifyRequest, reply: FastifyReply) {
    const { termsVersionId, privacyVersionId, languageUsed } = request.body as any;
    const user = (request as any).user;
    
    if (!user || !user.customerId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED' } });
    }

    const acceptance = await prisma.userLegalAcceptance.create({
      data: {
        userId: user.customerId,
        termsVersionId,
        privacyVersionId,
        language: languageUsed || 'en',
        telegramUserId: user.telegramId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        acceptedAt: new Date()
      }
    });
    
    return reply.status(201).send({ success: true, data: acceptance });
  }

  async getAcceptanceStatus(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    
    if (!user || !user.customerId) {
      return reply.send({ success: true, data: { hasAccepted: false } });
    }

    const acceptance = await prisma.userLegalAcceptance.findFirst({
      where: { 
        userId: user.customerId,
        termsVersion: { isCurrent: true },
        privacyVersion: { isCurrent: true }
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
