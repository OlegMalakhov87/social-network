/**

 * Формирует массив действий для комментария.
 *
 * @param {Object} props
 * @param {Object} props.comment - комментарий
 * @param {Object} props.currentUserId - ID текущего пользователя
 * @param {Function} props.toggleLike - функция для лайка/дизлайка комментария
 * @param {Function} props.onDelete - функция для удаления комментария
 * @param {Function} props.onEdit - функция для редактирования комментария
 * @param {Function} props.onShare - функция для поделиться комментарием
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
