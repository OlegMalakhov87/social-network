import { z } from 'zod';

import { UserSchema } from '../../user';

/**
 * Описывает лайк.
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
 * Описывает список лайков.
 */
export const LikesListSchema = z.array(LikeSchema);
