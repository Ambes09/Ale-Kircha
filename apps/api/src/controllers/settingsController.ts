import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';

export class SettingsController {
  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    const settings = await prisma.systemSetting.findMany();
    const result: any = {};
    settings.forEach(s => { result[s.key] = s.value; });
    return reply.send({ success: true, data: result });
  }

  async getSetting(request: FastifyRequest, reply: FastifyReply) {
    const { key } = request.params as { key: string };
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) {
      return reply.status(404).send({ success: false, error: { code: 'SETTING_NOT_FOUND', message: 'Setting not found' } });
    }
    return reply.send({ success: true, data: setting });
  }

  async updateSetting(request: FastifyRequest, reply: FastifyReply) {
    const { key } = request.params as { key: string };
    const { value, description } = request.body as any;
    
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description, type: "string", category: "general" }
    });
    return reply.send({ success: true, data: setting });
  }

  async getContactInfo(request: FastifyRequest, reply: FastifyReply) {
    const keys = ['contact_phone', 'contact_telegram', 'contact_email', 'contact_address', 'contact_website'];
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: keys } }
    });
    const result: any = {};
    settings.forEach(s => { result[s.key] = s.value; });
    return reply.send({ success: true, data: result });
  }
}
