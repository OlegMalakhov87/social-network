/**
 * Формирует массив действий для комментария.
 *
 * @param {Object} params - параметры
 * @param {Object} params.comment - комментарий
 * @param {Object} params.currentUserId - ID текущего пользователя
 * @param {Function} params.toggleLike - функция для лайка/дизлайка комментария
 * @param {Function} params.onDelete - функция для удаления комментария
 * @param {Function} params.onEdit - функция для редактирования комментария
 * @param {Function} params.onShare - функция для поделиться комментарием
 * @returns {Array<Object>} - массив действий для комментария
 */

export const getCommentActions = ({
  comment,
  currentUserId,
  toggleLike,
  onDelete,
  onEdit,
  onShare,
}) => {
  if (!comment) return [];

  const isAuthor = currentUserId === comment.userId;

  const actions = [
    {
      key: 'like',
      icon: comment.isLiked ? '❤️' : '🤍',
      label: String(comment.likesCount ?? 0),
      ariaLabel: comment.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(comment.id, comment.isLiked),
    },
    {
      key: 'share',
      icon: '↗️',
      label: 'Поделиться',
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    },
  ];

  if (isAuthor) {
    actions.push({
      key: 'edit',
      icon: '✏️',
      label: 'Редактировать',
      ariaLabel: 'Редактировать комментарий',
      onClick: () => onEdit?.(comment.id),
    });

    actions.push({
      key: 'delete',
      icon: '🗑️',
      label: 'Удалить',
      ariaLabel: 'Удалить комментарий',
      variant: 'danger',
      onClick: () => onDelete?.(comment.id),
    });
  }

  return actions;
};
