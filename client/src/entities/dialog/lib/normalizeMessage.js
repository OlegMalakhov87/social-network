import { parseSharedEntity } from '../../../shared/utils';

/**
 * Преобразует сообщение из ответа сервера в формат для Message.
 *
 * @param {Object} raw - сырое сообщение с сервера
 * @returns {Object} - объект нормализованного сообщения
 */
export const normalizeMessage = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    content: raw.content,
    createDate: raw.createdAt,
    updateDate: raw.updatedAt,
    date: raw.updatedAt ?? raw.createdAt,
    isRead: raw.isRead,
    isEdited: raw.isEdited,
    senderId: raw.senderId,
    receiverId: raw.receiverId,
    deletedBySender: raw.deletedBySender,
    deletedByReceiver: raw.deletedByReceiver,

    author: raw.author,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    sharedEntity: parseSharedEntity(raw.content),
  };
};
