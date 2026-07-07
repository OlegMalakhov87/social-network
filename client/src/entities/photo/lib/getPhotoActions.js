/**
 * Формирует массив действий для карточки фото.
 *
 * @param {Object} params
 * @param {Object} params.photo
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike
 * @param {(id:number)=>void} params.toggleComments
 * @param {Function} params.onShare
 *
 * @returns {Array}
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
      label: String(photo.sharedCount ?? 0),
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    });
  }

  return actions;
};
