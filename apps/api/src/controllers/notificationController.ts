import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const notificationController = {
  // Get all notifications for a customer
  async getNotifications(req: any, res: any) {
    try {
      const customer = req.user;
      const notifications = await prisma.notification.findMany({
        where: { 
          customer: { 
            connect: { id: customer.id } 
          } 
        },
        orderBy: { 
          createdAt: 'desc' 
        },
      });
      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Mark notification as read
  async markAsRead(req: any, res: any) {
    try {
      const { id } = req.params;
      const notification = await prisma.notification.update({
        where: { id },
        data: { 
          isRead: true 
        },
      });
      res.json({ success: true, data: notification });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Mark all notifications as read for a customer
  async markAllAsRead(req: any, res: any) {
    try {
      const customer = req.user;
      await prisma.notification.updateMany({
        where: { 
          customer: { 
            connect: { id: customer.id } 
          },
          isRead: false 
        },
        data: { 
          isRead: true 
        },
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get unread count
  async getUnreadCount(req: any, res: any) {
    try {
      const customer = req.user;
      const count = await prisma.notification.count({
        where: { 
          customer: { 
            connect: { id: customer.id } 
          },
          isRead: false 
        },
      });
      res.json({ success: true, data: { count } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export const NotificationController = notificationController;
export default notificationController;
