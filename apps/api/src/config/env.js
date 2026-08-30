import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    CUSTOMER_BOT_TOKEN: z.string().min(1),
    ADMIN_BOT_TOKEN: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    APP_URL: z.string().url().default('http://localhost:5173'),
    API_URL: z.string().url().default('http://localhost:4000'),
    CORS_ORIGINS: z.string().transform(s => s.split(',').map(o => o.trim())).default('http://localhost:5173,http://localhost:5174'),
    S3_ENDPOINT: z.string().url().optional(),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    PAYMENT_ADVICE_MAX_SIZE: z.coerce.number().default(5 * 1024 * 1024),
    DEFAULT_PAYMENT_DEADLINE_MINUTES: z.coerce.number().default(30),
    TELEGRAM_MODE: z.enum(['polling', 'webhook']).default('polling'),
});
export const env = envSchema.parse(process.env);
