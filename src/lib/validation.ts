import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(2000, "Content must not exceed 2000 characters"),
});

export const createProductSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(3000),
  price: z.number().positive().multipleOf(0.01).max(1_000_000),
  stock: z.number().int().min(0).max(100_000),
});

export const updateUserProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(500),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const purchaseSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(100),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
