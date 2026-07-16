/**
 * Конфигурация элементов управления карточкой поста.
 *
 * Каждый объект описывает одну кнопку EntityActions.
 *
 * @param {Object} params
 * @param {Object} params.post - данные поста
 * @param {Object} params.currentUser - текущий пользователь
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike - функция для лайка/дизлайка поста (id: номер поста, isLiked: boolean)
 * @param {(id:number)=>void} params.toggleComments - функция для открытия комментариев поста (id: номер поста)
 * @param {(id:number)=>void} params.onDelete - функция для удаления поста (id: номер поста)
 * @param {Function} params.onShare - переход на страницу сообщений для передачи поста
 * @param {(id:number)=>void} params.onUpdate - функция для обновления поста (id: номер поста)
 * @returns {Array<Object>} - массив действий карточки поста
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

  if (post.visibility === 'public') {
    actions.push({
      key: 'share',
      icon: '↗️',
      label: 'Поделиться',
      ariaLabel: 'Поделиться',

      onClick: () => onShare?.(),
    });
  }

  if (isAuthor) {
    actions.push({
      key: 'update',
      icon: '✏️',
      label: 'Обновить',
      ariaLabel: 'Обновить пост',

      onClick: () => onUpdate?.(post),
    });
  }
  if (isAuthor) {
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
