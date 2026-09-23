import { z } from 'zod';
import { UserSchema } from '../../user';

/**
 * Схема диалога
 */
export const DialogSchema = z.object({
  user: UserSchema.pick({ id: true, name: true, avatarUrl: true }),
  lastMessage: z
    .object({
      id: z.number(),
      content: z.string(),
      createdAt: z.string(),
      isRead: z.boolean().default(false),
      isOwn: z.boolean().default(false),
    })
    .optional(),
  unreadCount: z.number().default(0),
});

/**
 * Схема списка диалогов
 */
export const DialogsListSchema = z.array(DialogSchema);
