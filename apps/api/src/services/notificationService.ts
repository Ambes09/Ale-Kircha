import prisma from '../lib/prisma.js';

export class NotificationService {
  async notifyOrderStatusChange(orderId: string, oldStatus: string, newStatus: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          include: { user: true }
        },
        group: {
          include: { kirchaType: true }
        }
      }
    });

    if (!order || !order.customer) return null;

    const statusMessages: { [key: string]: { en: string; am: string } } = {
      'PAYMENT_CONFIRMED': {
        en: `✅ Payment confirmed for order ${order.orderNumber}. We will start preparing your Kircha.`,
        am: `✅ የትዕዛዝ ${order.orderNumber} ክፍያ ተረጋግጧል። ቅርጫዎን ማዘጋጀት እንጀምራለን።`
      },
      'PROCESSING': {
        en: `🔪 Your Kircha for order ${order.orderNumber} is being prepared.`,
        am: `🔪 የትዕዛዝ ${order.orderNumber} ቅርጫ እየተዘጋጀ ነው።`
      },
      'READY_FOR_DELIVERY': {
        en: `📦 Order ${order.orderNumber} is ready for delivery!`,
        am: `📦 ትዕዛዝ ${order.orderNumber} ለማድረስ ዝግጁ ነው!`
      },
      'OUT_FOR_DELIVERY': {
        en: `🚚 Order ${order.orderNumber} is out for delivery!`,
        am: `🚚 ትዕዛዝ ${order.orderNumber} በመድረስ ላይ ነው!`
      },
      'DELIVERED': {
        en: `🏠 Order ${order.orderNumber} has been delivered! Thank you for choosing Siga Kircha! 🙏`,
        am: `🏠 ትዕዛዝ ${order.orderNumber} ተደርሷል! ስጋ ቅርጫን ስለመረጡ እናመሰግናለን! 🙏`
      },
      'CANCELLED': {
        en: ` Order ${order.orderNumber} has been cancelled.`,
        am: ` ትዕዛዝ ${order.orderNumber} ተሰርዟል።`
      },
      'EXPIRED': {
        en: `⏰ Order ${order.orderNumber} has expired.`,
        am: `⏰ ትዕዛዝ ${order.orderNumber} ጊዜው አልፏል።`
      }
    };

    const message = statusMessages[newStatus] || {
      en: `📌 Order ${order.orderNumber} status: ${newStatus}`,
      am: `📌 የትዕዛዝ ${order.orderNumber} ሁኔታ: ${newStatus}`
    };

    await prisma.notification.create({
      data: {
        customerId: order.customer.id,
        type: 'ORDER_STATUS_UPDATE',
        title: `Order ${order.orderNumber} Update`,
        body: message.en,
        data: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: newStatus,
          oldStatus
        })
      }
    });

    return {
      telegramId: order.customer.user?.telegramId,
      messageEn: message.en,
      messageAm: message.am,
      order: order
    };
  }
}
