import { z } from 'zod';
import { CommentsListSchema } from '../../comment';
import { LikeSchema } from '../../like';
import { UserSchema } from '../../user';
/**
 * Схема новости
 */
export const NewsSchema = z.object({
  id: z.number(),
  uploadedBy: z.number(),
  title: z.string(),
  text: z.string(),
  category: z.string(),
  type: z.enum(['text', 'image', 'video']),
  source: z.string().nullable(),
  newsUrl: z.string().nullable(),
  previewUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  viewsCount: z.number().default(0),
  isEdited: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),

  uploader: UserSchema.pick({
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
 * Схема списка новостей
 */
export const NewsListSchema = z.array(NewsSchema);
