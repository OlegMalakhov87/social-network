import { z } from 'zod';

import { CommentsListSchema } from '../../../entities/comment';
import { LikeSchema } from '../../../entities/like';
import { UserSchema } from '../../../entities/user';

/**
 * Описывает пост.
 */
export const PostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  text: z.string().nullish(),
  type: z.enum(['text', 'image', 'video']),
  postUrl: z.string().nullish(),
  previewUrl: z.string().nullish(),
  thumbnailUrl: z.string().nullish(),
  pinned: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  isEdited: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),

  author: UserSchema.pick({
    id: true,
    name: true,
    avatarUrl: true,
  }).optional(),

  likes: z.array(LikeSchema.pick({ id: true, userId: true })).optional(),
  likesCount: z.number().optional(),
  isLiked: z.boolean().optional(),

  comments: CommentsListSchema.optional(),
  commentsCount: z.number().optional(),
});

/**
 * Описывает список постов.
 */
export const PostsListSchema = z.array(PostSchema);
