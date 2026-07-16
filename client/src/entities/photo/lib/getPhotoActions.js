/**
 * Формирует массив действий для карточки фото.
 *
 * @param {Object} params
 * @param {Object} params.photo - фото
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike - функция для лайка/дизлайка фото
 * @param {(id:number)=>void} params.toggleComments - функция для открытия/закрытия комментариев к фото
 * @param {Function} params.onShare - функция- переход на страницу сообщений для передачи фото
 * @returns {Array<Object>} - массив действий карточки фото
 */
export const getPhotoActions = ({
  photo,
  toggleLike,
  toggleComments,
  onShare,
}) => {
  if (!photo) return [];

  const actions = [
    {
      key: 'like',
      icon: photo.isLiked ? '❤️' : '🤍',
      label: String(photo.likesCount ?? 0),
      ariaLabel: photo.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(photo.id, photo.isLiked),
    },

    {
      key: 'comments',
      icon: '💬',
      label: String(photo.commentsCount ?? 0),
      ariaLabel: 'Комментарии',
      onClick: () => toggleComments?.(photo.id),
    },
  ];

  if (photo.visibility === 'public') {
    actions.push({
      key: 'share',
      icon: '↗️',
      label: 'Поделиться',
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    });
  }

  return actions;
};
