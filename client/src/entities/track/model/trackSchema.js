import { z } from 'zod';
import { CommentsListSchema } from '../../comment';
import { LikeSchema } from '../../like';
import { UserSchema } from '../../user';

/**
 * Схема трека
 */
export const TrackSchema = z.object({
  id: z.number(),
  uploadedBy: z.number(),
  title: z.string(),
  artist: z.string(),
  album: z.string().nullish(),
  description: z.string().nullish(),
  year: z.number().nullish(),
  duration: z.number().nullish(),
  size: z.number().nullish(),
  category: z.string(),
  audioUrl: z.string().nullish(),
  coverUrl: z.string().nullish(),
  isPublic: z.boolean().default(true),
  playsCount: z.number().default(0),
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
  libraryCreatedAt: z.string().nullish(),
  profileLibraryId: z.number().nullish(),

  likes: z.array(LikeSchema.pick({ id: true, userId: true })).optional(),
  likesCount: z.number().optional(),
  isLiked: z.boolean().optional(),

  comments: CommentsListSchema.optional(),
  commentsCount: z.number().optional(),
});

/**
 * Схема списка треков
 */
export const TracksListSchema = z.array(TrackSchema);
