/**
 * Возвращает действия комментария.
 *
 * @param {Object} params - Параметры действий
 * @param {Object} params.comment - Комментарий
 * @param {number} params.currentUserId - Идентификатор текущего пользователя
 * @param {Function} [params.toggleLike] - Обработчик лайка
 * @param {Function} [params.onDelete] - Обработчик удаления
 * @param {Function} [params.onEdit] - Обработчик правки
 * @param {Function} [params.onShare] - Обработчик отправки
 * @returns {Array<Object>} Действия комментария
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
      label: '',
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    },
  ];

  if (isAuthor) {
    actions.push({
      key: 'edit',
      icon: '✏️',
      label: '',
      ariaLabel: 'Редактировать комментарий',
      onClick: () => onEdit?.(comment.id),
    });

    actions.push({
      key: 'delete',
      icon: '🗑️',
      label: '',
      ariaLabel: 'Удалить комментарий',
      variant: 'danger',
      onClick: () => onDelete?.(comment.id),
    });
  }

  return actions;
};
