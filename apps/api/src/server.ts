import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
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

// Register plugins
fastify.register(cors, {
  origin: true,
  credentials: true,
});

fastify.register(helmet);

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// ============================================================
// HEALTH CHECKS
// ============================================================

fastify.get('/health', async () => {
  return {
    status: 'ok',
    service: 'ale-kircha-api',
    timestamp: new Date().toISOString(),
  };
});

fastify.get('/api/v1/health', async () => {
  const dbStatus = await prisma.$queryRaw`SELECT 1 as connected`
    .then(() => 'connected')
    .catch(() => 'disconnected');

  return {
    status: 'ok',
    service: 'ale-kircha-api',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  };
});

// ============================================================
// ADMIN AUTH MIDDLEWARE
// ============================================================

const ADMIN_IDS = process.env.ADMIN_TELEGRAM_IDS?.split(',').map(s => s.trim()) || [];

fastify.addHook('preHandler', async (request, reply) => {
  // Skip auth for health endpoints
  if (request.url.startsWith('/health') || request.url.startsWith('/api/v1/health')) {
    return;
  }

  // Check for admin endpoints
  if (request.url.startsWith('/api/v1/admin')) {
    const telegramId = request.headers['x-telegram-id'];
    if (!telegramId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing Telegram ID' }
      });
    }
    
    const id = String(telegramId);
    if (!ADMIN_IDS.includes(id)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized as admin' }
      });
    }
  }
});

// ============================================================
// TEST ENDPOINTS
// ============================================================

fastify.get('/api/v1/test', async () => {
  return {
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  };
});

// ============================================================
// CUSTOMER ENDPOINTS
// ============================================================

fastify.post('/api/v1/customers/register', async (request, reply) => {
  const body = request.body as any;
  
  if (!body.telegramId || !body.phone) {
    return reply.status(400).send({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'telegramId and phone are required' }
    });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { telegramId: String(body.telegramId) }
    });

    if (existing) {
      return {
        success: true,
        data: { user: existing, status: 'EXISTING' }
      };
    }

    const user = await prisma.user.create({
      data: {
        telegramId: String(body.telegramId),
        username: body.username || null,
        firstName: body.firstName || 'User',
        lastName: body.lastName || '',
        phoneNumber: body.phone,
        role: 'CUSTOMER',
      }
    });

    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        customerCode: `CUS-${String(Date.now()).slice(-8)}`,
        fullName: body.fullName || body.firstName || 'User',
        deliveryAddress: body.deliveryAddress || 'Not provided',
        phone: body.phone,
        city: body.city || '',
        subCity: body.subCity || '',
        woreda: body.woreda || '',
        houseNumber: body.houseNumber || '',
        landmark: body.landmark || '',
        termsAccepted: body.termsAccepted || false,
      }
    });

    return {
      success: true,
      data: { user, customer, status: 'CREATED' }
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed' }
    });
  }
});

fastify.get('/api/v1/customers/me', async (request, reply) => {
  const telegramId = request.headers['x-telegram-id'];
  if (!telegramId) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing Telegram ID' }
    });
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        user: {
          telegramId: String(telegramId)
        }
      },
      include: {
        user: true
      }
    });

    if (!customer) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Customer not found' }
      });
    }

    return {
      success: true,
      data: customer
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer' }
    });
  }
});

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

fastify.get('/api/v1/admin/check', async (request) => {
  const telegramId = request.headers['x-telegram-id'];
  const id = String(telegramId);
  
  const isAdmin = ADMIN_IDS.includes(id);
  
  return {
    success: true,
    data: {
      isAdmin,
      telegramId: id,
      role: isAdmin ? 'ADMIN' : null
    }
  };
});

fastify.get('/api/v1/admin/stats', async () => {
  const [users, customers, orders, groups, payments, refunds] = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.kirchaGroup.count(),
    prisma.payment.count(),
    prisma.refundRequest.count(),
  ]);

  return {
    success: true,
    data: {
      users,
      customers,
      orders,
      groups,
      payments,
      refunds,
      timestamp: new Date().toISOString()
    }
  };
});

fastify.get('/api/v1/admin/groups', async () => {
  const groups = await prisma.kirchaGroup.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      kirchaType: true,
    }
  });

  return {
    success: true,
    data: groups
  };
});

fastify.get('/api/v1/admin/orders', async () => {
  const orders = await prisma.order.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        include: { user: true }
      },
      group: true,
    }
  });

  return {
    success: true,
    data: orders
  };
});

fastify.get('/api/v1/admin/customers', async () => {
  const customers = await prisma.customer.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    }
  });

  return {
    success: true,
    data: customers
  };
});

fastify.get('/api/v1/admin/payments', async () => {
  const payments = await prisma.payment.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      order: true,
      paymentMethod: true,
    }
  });

  return {
    success: true,
    data: payments
  };
});

fastify.get('/api/v1/admin/refunds', async () => {
  const refunds = await prisma.refundRequest.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        include: { user: true }
      },
      order: true,
    }
  });

  return {
    success: true,
    data: refunds
  };
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
    
    await prisma.$queryRaw`SELECT 1`;
    fastify.log.info('✅ Database connected');
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
