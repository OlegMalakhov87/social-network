import { parseSharedEntity } from '../../../shared/utils';

/**
 * Нормализация списка сообщений.
 *
 * @param {Object} raw - сырой список сообщений
 * @returns {Object} - нормализованный список сообщений
 */
export const normalizeMessages = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    senderId: raw.senderId,
    receiverId: raw.receiverId,
    content: raw.content,
    isRead: raw.isRead,
    isEdited: raw.isEdited,
    deletedBySender: raw.deletedBySender,
    deletedByReceiver: raw.deletedByReceiver,
    createDate: raw.createdAt,
    updateDate: raw.updatedAt,
   
    author: raw.author,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    sharedEntity: parseSharedEntity(raw.content),
  };
};
