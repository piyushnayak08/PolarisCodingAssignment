import { z } from 'zod';

export const productSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  price: z.number(),
  description: z.string().optional(),
  category: z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
      name: z.string().optional(),
      slug: z.string().optional(),
    })
    .optional(),
});

export const productsResponseSchema = z.object({
  current_page: z.number().optional(),
  data: z.array(productSchema),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  total: z.number().optional(),
  last_page: z.number().optional(),
  per_page: z.number().optional(),
});

export const loginResponseSchema = z
  .object({
    access_token: z.string().optional(),
    token: z.string().optional(),
    data: z
      .object({
        access_token: z.string().optional(),
      })
      .optional(),
  })
  .refine((v: { access_token?: string; token?: string; data?: { access_token?: string } }) => Boolean(v.access_token || v.token || v.data?.access_token), {
    message: 'Expected token-like field in login response',
  });

export const profileSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  data: z
    .object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
});

export const cartCreateSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  cart_id: z.union([z.string(), z.number()]).optional(),
});

export const invoiceListSchema = z.union([
  z.object({ data: z.array(z.unknown()).optional() }),
  z.array(z.unknown()),
]);
