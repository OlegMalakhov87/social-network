import { z } from 'zod';
import { CommentsListSchema } from '../../../entities/comment';
import { LikeSchema } from '../../../entities/like';
import { UserSchema } from '../../../entities/user';

/**
 * Схема поста
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
  comments: CommentsListSchema.optional(),
  likesCount: z.number().optional(),
  isLiked: z.boolean().optional(),
  commentsCount: z.number().optional(),
});

/**
 * Схема списка постов
 */
export const PostsListSchema = z.array(PostSchema);
