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
  source: z.string().nullish(),
  newsUrl: z.string().nullish(),
  previewUrl: z.string().nullish(),
  thumbnailUrl: z.string().nullish(),
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
  likesCount: z.number().optional(),
  isLiked: z.boolean().optional(),
  commentsCount: z.number().optional(),
});

/**
 * Схема списка новостей
 */
export const NewsListSchema = z.array(NewsSchema);
