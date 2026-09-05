import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Note: In the Prisma schema, the model is "Customer" with an address field
// Not a separate "CustomerAddress" model
export const addressController = {
  // Get all addresses for a customer
  async getAddresses(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        deliveryAddress: true,
        city: true,
        subCity: true,
        woreda: true,
        houseNumber: true,
        landmark: true,
        latitude: true,
        longitude: true,
      }
    });
    return customer ? [customer] : [];
  },

  // Get single address (returns customer info)
  async getAddress(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        deliveryAddress: true,
        city: true,
        subCity: true,
        woreda: true,
        houseNumber: true,
        landmark: true,
        latitude: true,
        longitude: true,
      }
    });
  },

  // Create address (update customer)
  async createAddress(data: any) {
    return prisma.customer.update({
      where: { id: data.customerId },
      data: {
        deliveryAddress: data.address || data.deliveryAddress,
        city: data.city,
        subCity: data.subCity,
        woreda: data.woreda,
        houseNumber: data.houseNumber,
        landmark: data.landmark,
        latitude: data.latitude,
        longitude: data.longitude,
      }
    });
  },

  // Update address
  async updateAddress(id: string, data: any) {
    return prisma.customer.update({
      where: { id },
      data: {
        deliveryAddress: data.address || data.deliveryAddress,
        city: data.city,
        subCity: data.subCity,
        woreda: data.woreda,
        houseNumber: data.houseNumber,
        landmark: data.landmark,
        latitude: data.latitude,
        longitude: data.longitude,
      }
    });
  },

  // Delete address (set to null)
  async deleteAddress(id: string) {
    return prisma.customer.update({
      where: { id },
      data: {
        deliveryAddress: null,
        city: null,
        subCity: null,
        woreda: null,
        houseNumber: null,
        landmark: null,
        latitude: null,
        longitude: null,
      }
    });
  },
};
