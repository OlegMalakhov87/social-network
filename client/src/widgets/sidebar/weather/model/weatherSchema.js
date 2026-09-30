import { z } from 'zod';

/**
 * Схема ответа API погоды.
 */
export const WeatherSchema = z.object({
  city: z.string(),
  temp: z.number(),
  icon: z.string(),
  label: z.string(),
  windSpeed: z.number(),
  humidity: z.number().optional(),
  pressure: z.number().optional(),
  sunrise: z.string().optional(),
  sunset: z.string().optional(),
  updatedAt: z.string(),
});
