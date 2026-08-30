import prisma from '../lib/prisma.js';
export class SettingsController {
    async getSettings(request, reply) {
        const settings = await prisma.systemSetting.findMany();
        const result = {};
        settings.forEach(s => { result[s.key] = s.value; });
        return reply.send({ success: true, data: result });
    }
    async getSetting(request, reply) {
        const { key } = request.params;
        const setting = await prisma.systemSetting.findUnique({ where: { key } });
        if (!setting) {
            return reply.status(404).send({ success: false, error: { code: 'SETTING_NOT_FOUND', message: 'Setting not found' } });
        }
        return reply.send({ success: true, data: setting });
    }
    async updateSetting(request, reply) {
        const { key } = request.params;
        const { value, description } = request.body;
        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value, description },
            create: { key, value, description }
        });
        return reply.send({ success: true, data: setting });
    }
    async getContactInfo(request, reply) {
        const keys = ['contact_phone', 'contact_telegram', 'contact_email', 'contact_address', 'contact_website'];
        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: keys } }
        });
        const result = {};
        settings.forEach(s => { result[s.key] = s.value; });
        return reply.send({ success: true, data: result });
    }
}
