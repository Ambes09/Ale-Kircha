import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { Pool } from 'pg';

// ============================================================
// DATABASE CONNECTION
// ============================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ============================================================
// FASTIFY SERVER
// ============================================================

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

fastify.register(cors, { origin: true, credentials: true });
fastify.register(helmet);
fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// ============================================================
// HEALTH CHECKS
// ============================================================

fastify.get('/health', async () => {
  return { status: 'ok', service: 'ale-kircha-api', timestamp: new Date().toISOString() };
});

fastify.get('/api/v1/health', async () => {
  try {
    await pool.query('SELECT 1 as connected');
    return { status: 'ok', service: 'ale-kircha-api', version: '1.0.0', database: 'connected', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'degraded', service: 'ale-kircha-api', version: '1.0.0', database: 'disconnected', timestamp: new Date().toISOString() };
  }
});

// ============================================================
// ADMIN AUTH
// ============================================================

const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(s => s.trim());

fastify.addHook('preHandler', async (request, reply) => {
  if (request.url.startsWith('/health') || request.url.startsWith('/api/v1/health')) {
    return;
  }
  if (request.url.startsWith('/api/v1/admin')) {
    const telegramId = request.headers['x-telegram-id'];
    if (!telegramId) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing Telegram ID' } });
    }
    const id = String(telegramId);
    if (!ADMIN_IDS.includes(id)) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized as admin' } });
    }
  }
});

// ============================================================
// API ENDPOINTS (CUSTOMERS)
// ============================================================

fastify.post('/api/v1/customers/register', async (request, reply) => {
  const body = request.body as any;
  if (!body.telegramId || !body.phone) {
    return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'telegramId and phone are required' } });
  }
  try {
    const existing = await pool.query('SELECT * FROM "User" WHERE "telegramId" = $1', [String(body.telegramId)]);
    if (existing.rows.length > 0) {
      return { success: true, data: { user: existing.rows[0], status: 'EXISTING' } };
    }
    const userResult = await pool.query(
      `INSERT INTO "User" ("telegramId", "username", "firstName", "lastName", "phoneNumber", "role", "language")
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [String(body.telegramId), body.username || null, body.firstName || 'User', body.lastName || '', body.phone, 'CUSTOMER', body.language || 'en']
    );
    const user = userResult.rows[0];
    const customerResult = await pool.query(
      `INSERT INTO "Customer" ("userId", "customerCode", "fullName", "deliveryAddress", "phone", "termsAccepted")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.id, `CUS-${String(Date.now()).slice(-8)}`, body.fullName || body.firstName || 'User', body.deliveryAddress || 'Not provided', body.phone, body.termsAccepted || false]
    );
    return { success: true, data: { user, customer: customerResult.rows[0], status: 'CREATED' } };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } });
  }
});

fastify.get('/api/v1/customers/me', async (request, reply) => {
  const telegramId = request.headers['x-telegram-id'];
  if (!telegramId) {
    return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing Telegram ID' } });
  }
  try {
    const result = await pool.query(
      `SELECT c.*, u."telegramId", u."username", u."phoneNumber" FROM "Customer" c JOIN "User" u ON c."userId" = u.id WHERE u."telegramId" = $1`,
      [String(telegramId)]
    );
    if (result.rows.length === 0) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }
    return { success: true, data: result.rows[0] };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer' } });
  }
});

// ============================================================
// API ENDPOINTS (ADMIN)
// ============================================================

fastify.get('/api/v1/admin/check', async (request) => {
  const telegramId = request.headers['x-telegram-id'];
  const id = String(telegramId);
  const isAdmin = ADMIN_IDS.includes(id);
  return { success: true, data: { isAdmin, telegramId: id, role: isAdmin ? 'ADMIN' : null } };
});

fastify.get('/api/v1/admin/stats', async (request, reply) => {
  const telegramId = request.headers['x-telegram-id'];
  if (!ADMIN_IDS.includes(String(telegramId))) {
    return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } });
  }
  try {
    const [users, customers, orders, groups, payments, refunds] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM "User"'),
      pool.query('SELECT COUNT(*) FROM "Customer"'),
      pool.query('SELECT COUNT(*) FROM "Order"'),
      pool.query('SELECT COUNT(*) FROM "KirchaGroup"'),
      pool.query('SELECT COUNT(*) FROM "Payment"'),
      pool.query('SELECT COUNT(*) FROM "RefundRequest"'),
    ]);
    return {
      success: true,
      data: {
        users: parseInt(users.rows[0].count),
        customers: parseInt(customers.rows[0].count),
        orders: parseInt(orders.rows[0].count),
        groups: parseInt(groups.rows[0].count),
        payments: parseInt(payments.rows[0].count),
        refunds: parseInt(refunds.rows[0].count),
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } });
  }
});

// ============================================================
// START BOTS
// ============================================================

// Import and start Customer Bot
console.log('🤖 Starting Customer Bot...');
import('./customer-bot').then(() => {
  console.log('✅ Customer Bot imported and ready');
}).catch((err) => {
  console.error('❌ Failed to load Customer Bot:', err.message);
});

// Import and start Admin Bot
console.log('🤖 Starting Admin Bot...');
import('./admin-bot').then(() => {
  console.log('✅ Admin Bot imported and ready');
}).catch((err) => {
  console.error('❌ Failed to load Admin Bot:', err.message);
});

// ============================================================
// START SERVER
// ============================================================

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    fastify.log.info(`🚀 Ale Kircha API running on ${host}:${port}`);
    fastify.log.info(`📊 Health check: http://${host}:${port}/health`);
    await pool.query('SELECT 1');
    fastify.log.info('✅ Database connected');
    console.log('');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('🟢 ALL SERVICES STARTED SUCCESSFULLY!');
    console.log(`📡 API: http://localhost:${port}`);
    console.log('🤖 Customer Bot: Running');
    console.log('🤖 Admin Bot: Running');
    console.log('════════════════════════════════════════════════════════════════');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
