import { z } from 'zod';

// Ethiopian phone normalization
export const phoneSchema = z.string().transform((val) => {
  let cleaned = val.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('0')) cleaned = '+251' + cleaned.slice(1);
  else if (!cleaned.startsWith('+')) cleaned = '+251' + cleaned;
  return cleaned;
});

export const customerRegistrationSchema = z.object({
  telegramId: z.string(),
  username: z.string().optional(),
  firstName: z.string(),
  lastName: z.string().optional(),
  phone: phoneSchema,
  additionalPhone: phoneSchema.optional(),
  fullName: z.string().min(2),
  preferredLanguage: z.enum(['en', 'am']).default('en'),
});

export const addressSchema = z.object({
  city: z.string().min(1),
  subCity: z.string().optional(),
  woreda: z.string().optional(),
  houseNumber: z.string().optional(),
  landmark: z.string().optional(),
  directions: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CustomerRegistration = z.infer<typeof customerRegistrationSchema>;
export type Address = z.infer<typeof addressSchema>;
