import { z } from 'zod';

export const verifyOidSchema = z.object({
  oid: z.string().min(1, 'OID is required'),
  // userId: z.string().min(1, 'User ID is required'),
});

export type VerifyOidInput = z.infer<typeof verifyOidSchema>;
