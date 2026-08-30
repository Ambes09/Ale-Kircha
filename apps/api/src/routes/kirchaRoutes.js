import { KirchaTypeController } from '../controllers/kirchaTypeController.js';
import { KirchaGroupController } from '../controllers/kirchaGroupController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
export async function kirchaRoutes(fastify) {
    const typeController = new KirchaTypeController();
    const groupController = new KirchaGroupController();
    // ==================== Kircha Types ====================
    fastify.get('/api/v1/kircha/types', typeController.getAllTypes.bind(typeController));
    fastify.get('/api/v1/kircha/types/:id', typeController.getType.bind(typeController));
    fastify.post('/api/v1/kircha/types', { preHandler: requireAdmin }, typeController.createType.bind(typeController));
    fastify.put('/api/v1/kircha/types/:id', { preHandler: requireAdmin }, typeController.updateType.bind(typeController));
    fastify.delete('/api/v1/kircha/types/:id', { preHandler: requireAdmin }, typeController.deleteType.bind(typeController));
    // ==================== Kircha Groups ====================
    fastify.get('/api/v1/kircha/groups', groupController.getAllGroups.bind(groupController));
    fastify.get('/api/v1/kircha/groups/available', groupController.getAvailableGroups.bind(groupController));
    fastify.get('/api/v1/kircha/groups/:id', groupController.getGroup.bind(groupController));
    fastify.post('/api/v1/kircha/groups', { preHandler: requireAdmin }, groupController.createGroup.bind(groupController));
    fastify.put('/api/v1/kircha/groups/:id', { preHandler: requireAdmin }, groupController.updateGroup.bind(groupController));
    fastify.delete('/api/v1/kircha/groups/:id', { preHandler: requireAdmin }, groupController.deleteGroup.bind(groupController));
    fastify.patch('/api/v1/kircha/groups/:id/status', { preHandler: requireAdmin }, groupController.updateGroupStatus.bind(groupController));
    fastify.post('/api/v1/kircha/groups/:id/join', { preHandler: authenticate }, groupController.joinGroup.bind(groupController));
    fastify.post('/api/v1/kircha/groups/migrate', { preHandler: requireAdmin }, groupController.migrateUser.bind(groupController));
}
