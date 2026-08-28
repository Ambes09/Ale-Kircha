import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../errors/index.js';
import prisma from '../lib/prisma.js';

async function isUserBanned(telegramId: string): Promise<boolean> {
  const ban = await prisma.bannedUser.findUnique({
    where: { telegramId }
  });

  if (!ban || !ban.active) return false;
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

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const telegramId = request.headers['x-telegram-id'];
  if (!telegramId) {
    throw new UnauthorizedError('Telegram authentication required');
  }

  // Check if user is banned
  const banned = await isUserBanned(String(telegramId));
  if (banned) {
    throw new UnauthorizedError('You have been banned from this service');
  }

  (request as any).user = { telegramId: String(telegramId) };
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply);
  
  const telegramId = (request as any).user?.telegramId;
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());
  
  if (!adminIds.includes(telegramId)) {
    throw new UnauthorizedError('Admin access required');
  }
}

export async function requireSuperAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAdmin(request, reply);
}
