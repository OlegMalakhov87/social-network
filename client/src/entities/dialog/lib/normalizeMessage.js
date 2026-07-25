import { parseSharedEntity } from '../../../entities/sharedEntity';

/**
 * Преобразует сообщение из ответа сервера в формат для Message.
 *
 * @param {Object} raw - сырое сообщение с сервера
 * @param {number|null} currentUserId - ID текущего пользователя
 * @returns {Object} - объект нормализованного сообщения
 */
export const normalizeMessage = (raw, currentUserId) => ({
  id: raw.id,
  text: raw.message,
  createDate: raw.createdAt,
  updateDate: raw.updatedAt,
  isRead: raw.isRead,
  isEdited: raw.isEdited,
  senderId: raw.senderId,
  receiverId: raw.receiverId,

  likesCount: raw.likes?.length ?? 0,
  isLiked: raw.likes?.some((like) => like.userId === currentUserId) ?? false,

  sharedEntity: parseSharedEntity(raw.message),
});
