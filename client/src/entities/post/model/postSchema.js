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
  text: z.string().nullable(),
  type: z.enum(['text', 'image', 'video']),
  postUrl: z.string().nullable(),
  previewUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
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
  likesCount: z.number().default(0),
  isLiked: z.boolean().default(false),
  commentsCount: z.number().default(0),
});

/**
 * Схема списка постов
 */
export const PostsListSchema = z.array(PostSchema);
