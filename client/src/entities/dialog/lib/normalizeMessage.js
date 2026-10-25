/**
 * Приводит сообщение к формату карточки.
 *
 * @param {Object} raw - Сообщение с сервера
 * @returns {Object} Сообщение карточки
 */
export const normalizeMessages = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    senderId: raw.senderId,
    receiverId: raw.receiverId,
    content: raw.content,
    isRead: raw.isRead ?? false,
    isEdited: raw.isEdited ?? false,
    deletedBySender: raw.deletedBySender ?? false,
    deletedByReceiver: raw.deletedByReceiver ?? false,
    createDate: raw.createdAt,
    updateDate: raw.updatedAt,

    sender: raw.sender,
    receiver: raw.receiver,

    likes: raw.likes,
    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,
  };
};
