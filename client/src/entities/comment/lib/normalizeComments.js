/**
 * Приводит комментарий с сервера к формату карточки.
 *
 * @param {Object} raw - Комментарий с сервера
 * @returns {Object} Комментарий карточки
 */
export const normalizeComments = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    userId: raw.userId,
    targetType: raw.targetType,
    targetId: raw.targetId,
    text: raw.text,
    isEdited: raw.isEdited ?? false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    author: {
      id: raw.author.id,
      name: raw.author.name,
      avatarUrl: raw.author.avatarUrl,
      online: raw.author.online,
    },

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,
  };
};
