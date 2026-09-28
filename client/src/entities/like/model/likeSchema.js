import { z } from 'zod';
import { UserSchema } from '../../user';
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

  user: UserSchema.pick({
    id: true,
    name: true,
    avatarUrl: true,
  }),
});

/**
 * Схема списка лайков
 */
export const LikesListSchema = z.array(LikeSchema);
