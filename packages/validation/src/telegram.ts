import { z } from 'zod';

export const telegramInitDataSchema = z.object({
  query_id: z.string(),
  user: z.string().transform((s) => JSON.parse(s)),
  auth_date: z.string(),
  hash: z.string(),
});
