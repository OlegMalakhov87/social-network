import { z } from 'zod';

/**
 * Схема трека
 */
export const TrackSchema = z.object({
  id: z.number(),
  uploadedBy: z.number(),
  title: z.string(),
  artist: z.string(),
  album: z.string().nullable(),
  year: z.number().nullable(),
  duration: z.number().nullable(),
  size: z.number().nullable().optional(),
  genre: z.string(),
  audioUrl: z.string().nullable(),
  coverUrl: z.string().nullable(),
  isPublic: z.boolean(),
  playsCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Схема списка треков
 */
export const TracksListSchema = z.array(TrackSchema);
