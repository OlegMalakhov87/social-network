import { z } from 'zod';
import { LikeSchema } from '../../like';
import { UserSchema } from '../../user';

/**
 * Схема сообщения
 */
export const MessageSchema = z.object({
  id: z.number(),
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string(),
  isRead: z.boolean().default(false),
  isEdited: z.boolean().default(false),
  deletedBySender: z.boolean().default(false),
  deletedByReceiver: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),

  sender: UserSchema.pick({ id: true, name: true, avatarUrl: true }).optional(),
  receiver: UserSchema.pick({
    id: true,
    name: true,
    avatarUrl: true,
  }).optional(),

  likes: z.array(LikeSchema.pick({ id: true, userId: true })).optional(),
  likesCount: z.number().optional(),
  isLiked: z.boolean().optional(),
});

/**
 * Схема списка сообщений
 */
export const MessagesListSchema = z.array(MessageSchema);
