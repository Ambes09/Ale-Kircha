import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const reportController = {
  // Get sales report
  async getSalesReport(req: any, res: any) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          payment: true,
          customer: true,
        },
      });

      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const totalOrders = orders.length;
      const paidOrders = orders.filter(o => o.payment?.status === 'CONFIRMED').length;
      const pendingOrders = orders.filter(o => o.payment?.status === 'PENDING').length;

      res.json({
        success: true,
        data: {
          totalRevenue,
          totalOrders,
          paidOrders,
          pendingOrders,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get order report
  async getOrderReport(req: any, res: any) {
    try {
      const orders = await prisma.order.findMany();
      const total = orders.length;
      const completed = orders.filter(o => o.status === 'COMPLETED').length;
      const pending = orders.filter(o => o.status === 'PENDING').length;
      const cancelled = orders.filter(o => o.status === 'CANCELLED').length;

      res.json({
        success: true,
        data: { total, completed, pending, cancelled },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get payment report
  async getPaymentReport(req: any, res: any) {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          customer: true,
        },
      });

      const totalPaid = payments.filter(p => p.status === 'CONFIRMED').reduce((s, p) => s + Number(p.amount), 0);
      const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount), 0);
      const totalRejected = payments.filter(p => p.status === 'REJECTED').reduce((s, p) => s + Number(p.amount), 0);
      const countPaid = payments.filter(p => p.status === 'CONFIRMED').length;
      const countPending = payments.filter(p => p.status === 'PENDING').length;

      res.json({
        success: true,
        data: {
          totalPaid,
          totalPending,
          totalRejected,
          countPaid,
          countPending,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get delivery report
  async getDeliveryReport(req: any, res: any) {
    try {
      const deliveries = await prisma.delivery.findMany({
        include: {
          order: {
            include: {
              customer: true,
            },
          },
        },
      });

      const pending = deliveries.filter(d => d.status === 'PENDING').length;
      const assigned = deliveries.filter(d => d.status === 'ASSIGNED').length;
      const delivered = deliveries.filter(d => d.status === 'DELIVERED').length;
      const failed = deliveries.filter(d => d.status === 'FAILED_DELIVERY').length;

      res.json({
        success: true,
        data: { pending, assigned, delivered, failed },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get customer report
  async getCustomerReport(req: any, res: any) {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          orders: true,
          memberships: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const report = customers.map((c: any) => ({
        id: c.id,
        fullName: c.fullName,
        phone: c.user?.phone || 'N/A',
        totalOrders: c.orders?.length || 0,
        totalSpent: (c.orders || []).reduce((s: number, o: any) => s + Number(o.totalAmount), 0),
        groupsJoined: c.memberships?.length || 0,
        lastOrder: c.orders?.length > 0 ? c.orders[0].createdAt : null,
        status: c.status,
      }));

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get group report
  async getGroupReport(req: any, res: any) {
    try {
      const groups = await prisma.kirchaGroup.findMany({
        include: {
          kirchaType: true,
          memberships: true,
          orders: true,
        },
      });

      const report = groups.map((g: any) => {
        const totalMembers = g.memberships?.length || 0;
        const totalOrders = g.orders?.length || 0;
        const totalRevenue = (g.orders || []).reduce((s: number, o: any) => s + Number(o.totalAmount), 0);
        const occupancy = g.maxQuota > 0 ? ((g.reservedQuota || 0) / g.maxQuota * 100) : 0;

        return {
          id: g.id,
          name: g.name,
          type: g.kirchaType?.nameEn || 'N/A',
          maxQuota: g.maxQuota,
          reservedQuota: g.reservedQuota || 0,
          soldQuota: g.soldQuota || 0,
          totalMembers,
          totalOrders,
          totalRevenue,
          occupancy: Math.round(occupancy),
          status: g.status,
        };
      });

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export const ReportController = reportController;
export default reportController;
