import { z } from 'zod';
import { LikeSchema } from '../../like';
import { UserSchema } from '../../user';

/**
 * Схема комментария
 */
export const CommentSchema = z.object({
  id: z.number(),
  userId: z.number(),
  targetType: z.string(),
  targetId: z.number(),
  text: z.string(),
  isEdited: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),

  author: UserSchema.pick({ id: true, name: true, avatarUrl: true }).optional(),

  likes: z.array(LikeSchema.pick({ id: true, userId: true })).optional(),
  likesCount: z.number().default(0),
  isLiked: z.boolean().default(false),
});

/**
 * Схема списка комментариев
 */
export const CommentsListSchema = z.array(CommentSchema);
