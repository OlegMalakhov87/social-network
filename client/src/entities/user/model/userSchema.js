import { z } from 'zod';

/**
 * Схема пользователя
 */
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  nickname: z.string().nullish(),
  email: z.string().email().optional(),
  birthDate: z.string().nullish(),
  address: z.string().nullish(),
  job: z.string().nullish(),
  status: z.string().nullish(),
  phone: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  isPublic: z.boolean().optional(),
  gender: z.enum(['male', 'female']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  friendshipStatus: z.enum(['pending', 'accepted', 'blocked']).nullish(),
  friendshipDirection: z.enum(['incoming', 'outgoing']).nullish(),
  friendshipId: z.number().nullish(),
  canSeeFullProfile: z.boolean().nullish(),
  isBlocked: z.boolean().nullish(),
});

/**
 * Схема списка пользователей
 */
export const UsersListSchema = z.array(UserSchema);
