import { expect, type TestInfo } from '@playwright/test';
import type { ZodSchema } from 'zod';

export function assertSchema<T>(schema: ZodSchema<T>, payload: unknown, testInfo?: TestInfo): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    if (testInfo) {
      testInfo.attach('schema-validation-errors.json', {
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(result.error.issues, null, 2)),
      });
    }
  }
  expect(result.success, JSON.stringify(result.success ? [] : result.error.issues, null, 2)).toBeTruthy();
  return result.success ? result.data : (payload as T);
}
