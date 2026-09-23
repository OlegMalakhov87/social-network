import { z } from 'zod';

/**
 * Схема лайка
 */
export const LikeSchema = z.object({
  id: z.number(),
  userId: z.number(),
  targetType: z.string(),
  targetId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Схема списка лайков
 */
export const LikesListSchema = z.array(LikeSchema);
