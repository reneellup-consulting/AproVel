import { zValidator } from '@hono/zod-validator';
import type { ZodType } from 'zod';

export const validate = <T extends ZodType>(
  target: 'json' | 'query' | 'param' | 'form',
  schema: T,
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      // 1. Flatten the Zod errors into a simple key-value format
      // Example: { email: "Invalid email", password: "Too short" }
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        // use the first path segment as the key (e.g., 'email')
        const key = issue.path[0];
        fieldErrors[String(key)] = issue.message;
      });

      // 2. Return the clean JSON response
      return c.json(
        {
          success: false,
          message: 'Validation failed',
          errors: fieldErrors,
        },
        400,
      );
    }
  });
