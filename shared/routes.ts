import { z } from 'zod';
import { insertArticleSchema, insertPaymentSchema, insertPackSchema, articles, premiumPacks, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === ARTICLES ===
  articles: {
    list: {
      method: 'GET' as const,
      path: '/api/articles',
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof articles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/articles/:id',
      responses: {
        200: z.custom<typeof articles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: { // Admin/AI only
      method: 'POST' as const,
      path: '/api/articles',
      input: insertArticleSchema,
      responses: {
        201: z.custom<typeof articles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    generate: { // Trigger AI generation
      method: 'POST' as const,
      path: '/api/articles/generate',
      input: z.object({
        topic: z.string(),
        category: z.string(),
      }),
      responses: {
        201: z.custom<typeof articles.$inferSelect>(),
        500: errorSchemas.internal,
      },
    },
  },

  // === PREMIUM PACKS ===
  packs: {
    list: {
      method: 'GET' as const,
      path: '/api/packs',
      responses: {
        200: z.array(z.custom<typeof premiumPacks.$inferSelect>()),
      },
    },
  },

  // === PAYMENTS (Razorpay) ===
  payments: {
    createOrder: {
      method: 'POST' as const,
      path: '/api/payments/create-order',
      input: z.object({
        packId: z.number(),
      }),
      responses: {
        200: z.object({
          orderId: z.string(),
          amount: z.number(),
          currency: z.string(),
          keyId: z.string(), // Razorpay Key ID to send to frontend
        }),
        401: errorSchemas.unauthorized,
      },
    },
    verify: {
      method: 'POST' as const,
      path: '/api/payments/verify',
      input: z.object({
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
        packId: z.number(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
      },
    },
  },

  // === USER ACCESS ===
  user: {
    me: {
      method: 'GET' as const,
      path: '/api/user/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    downloadPdf: {
      method: 'POST' as const,
      path: '/api/articles/:id/download',
      responses: {
        200: z.object({ url: z.string() }),
        403: z.object({ message: z.string(), requiredPack: z.string().optional() }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
