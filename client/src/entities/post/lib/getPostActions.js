/**
 * Конфигурация элементов управления карточкой поста.
 *
 * Каждый объект описывает одну кнопку EntityActions.
 *
 * @param {Object} params
 * @param {Object} params.post
 * @param {Object} params.currentUser
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike
 * @param {(id:number)=>void} params.toggleComments
 * @param {(id:number)=>void} params.onDelete
 * @param {Function} params.onShare
 *
 * @returns {Array}
 */
export const getPostActions = ({
  post,
  currentUser,
  toggleLike,
  toggleComments,
  onDelete,
  onShare,
}) => {
  if (!post) return [];

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

  if (post.visibility === 'public') {
    actions.push({
      key: 'share',
      icon: '↗️',
      label: String(post.sharedCount ?? 0),
      ariaLabel: 'Поделиться',

      onClick: () => onShare?.(),
    });
  }

  if (currentUser?.id === post.userId) {
    actions.push({
      key: 'delete',
      icon: '🗑️',
      label: 'Удалить',
      ariaLabel: 'Удалить пост',

      onClick: () => onDelete?.(post.id),
    });
  }

  return actions;
};
