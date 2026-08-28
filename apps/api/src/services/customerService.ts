import prisma from '../lib/prisma.js';
import { CustomerRepository } from '../repositories/customerRepository.js';
import { ConflictError } from '../errors/index.js';
import { normalizePhone } from '../utils/phone.js';

export class CustomerService {
  private customerRepo: CustomerRepository;

  constructor() {
    this.customerRepo = new CustomerRepository(prisma);
  }

  async register(data: {
    telegramId: string;
    username?: string;
    firstName: string;
    lastName?: string;
    phone: string;
    fullName: string;
    preferredLanguage?: string;
  }) {
    const existing = await this.customerRepo.findByTelegramId(data.telegramId);
    if (existing) {
      throw new ConflictError('User already registered');
    }

    const normalizedPhone = normalizePhone(data.phone);
    return this.customerRepo.create({
      ...data,
      phone: normalizedPhone,
      preferredLanguage: data.preferredLanguage || 'en'
    });
  }

  async getProfile(telegramId: string) {
    const customer = await this.customerRepo.findByTelegramId(telegramId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async updateProfile(telegramId: string, data: any) {
    const customer = await this.customerRepo.findByTelegramId(telegramId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return this.customerRepo.update(customer.id, data);
  }
}
