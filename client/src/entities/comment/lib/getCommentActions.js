/**

 * Формирует массив действий для комментария.
 *
 * @param {Object} props
 * @param {Object} props.comment
 * @param {Object} props.currentUserId
 * @param {Function} props.toggleLike
 * @param {Function} props.onDelete
 * @param {Function} props.onEdit
 */

export const getCommentActions = (
  comment,
  currentUserId,
  toggleLike,
  onDelete,
  onEdit,
  shareComment
) => {
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
      label: String(comment.sharedCount ?? 0),
      ariaLabel: 'Поделиться',
      onClick: () => shareComment?.(comment.id),
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
