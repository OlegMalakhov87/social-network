import { z } from 'zod';
import { CommentsListSchema } from '../../comment';
import { LikeSchema } from '../../like';
import { UserSchema } from '../../user';

/**
 * Схема видео
 */
export const VideoSchema = z.object({
  id: z.number(),
  uploadedBy: z.number(),
  title: z.string(),
  description: z.string().nullish(),
  duration: z.number().nullish(),
  size: z.coerce.number().nullish(),
  year: z.number().nullish(),
  videoUrl: z.string().nullish(),
  previewUrl: z.string().nullish(),
  thumbnailUrl: z.string().nullish(),
  category: z.string(),
  isPublic: z.boolean().default(true),
  viewsCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),

  uploader: UserSchema.pick({
    id: true,
    name: true,
    avatarUrl: true,
  }).optional(),

  isInLibrary: z.boolean().optional(),
  libraryId: z.number().nullish(),
  isFavorite: z.boolean().optional(),
  lastWatchedAt: z.string().nullish(),
  libraryCreatedAt: z.string().nullish(),
  profileLibraryId: z.number().nullish(),

  likes: z.array(LikeSchema.pick({ id: true, userId: true })).optional(),
  likesCount: z.number().optional(),
  isLiked: z.boolean().optional(),

  comments: CommentsListSchema.optional(),
  commentsCount: z.number().optional(),
});

/**
 * Схема списка видео
 */
export const VideosListSchema = z.array(VideoSchema);
