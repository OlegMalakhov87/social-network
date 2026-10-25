/**
 * Возвращает действия поста.
 *
 * @param {Object} params - Параметры действий
 * @param {Object} params.post - Пост
 * @param {Object} params.currentUser - Текущий пользователь
 * @param {Function} [params.toggleLike] - Обработчик лайка
 * @param {Function} [params.toggleComments] - Обработчик комментариев
 * @param {Function} [params.onDelete] - Обработчик удаления
 * @param {Function} [params.onShare] - Обработчик отправки
 * @param {Function} [params.onUpdate] - Обработчик обновления
 * @returns {Array<Object>} Действия поста
 */
export const getPostActions = ({
  post,
  currentUser,
  toggleLike,
  toggleComments,
  onDelete,
  onShare,
  onUpdate,
}) => {
  if (!post) return [];

  const isAuthor = currentUser?.id === post.userId;

  const actions = [
    {
      key: 'like',
      icon: post.isLiked ? '❤️' : '🤍',
      label: String(post.likesCount ?? 0),
      ariaLabel: post.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(post.id, post.isLiked),
    },

    {
      key: 'comments',
      icon: '💬',
      label: String(post.commentsCount ?? 0),
      ariaLabel: 'Комментарии',
      onClick: () => toggleComments?.(post.id),
    },
  ];

  if (post.isPublic !== false) {
    actions.push({
      key: 'share',
      icon: '↗️',
      label: '',
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    });
  }

  if (isAuthor) {
    actions.push({
      key: 'update',
      icon: '✏️',
      label: '',
      ariaLabel: 'Обновить пост',
      onClick: () => onUpdate?.(post),
    });
  }
  if (isAuthor) {
    actions.push({
      key: 'delete',
      icon: '🗑️',
      label: '',
      ariaLabel: 'Удалить пост',
      onClick: () => onDelete?.(post.id),
    });
  }
  return actions;
};
