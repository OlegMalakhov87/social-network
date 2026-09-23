import { z } from 'zod';

/**
 * Схема видео
 */
export const VideoSchema = z.object({
  id: z.number(),
  uploadedBy: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  duration: z.number().nullable(),
  size: z.number().nullable(),
  year: z.number().nullable(),
  videoUrl: z.string().nullable(),
  previewUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  category: z.string(),
  isPublic: z.boolean(),
  viewsCount: z.number(),
  libraryId: z.number().nullable().optional(),
  isInLibrary: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Схема списка видео
 */
export const VideosListSchema = z.array(VideoSchema);
