/**
 * Возвращает действия фотографии.
 *
 * @param {Object} params - Параметры действий
 * @param {Object} params.photo - Фотография
 * @param {Function} [params.toggleLike] - Обработчик лайка
 * @param {Function} [params.toggleComments] - Обработчик комментариев
 * @param {Function} [params.onShare] - Обработчик отправки
 * @returns {Array<Object>} Действия фотографии
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

  if (photo.isPublic === true) {
    actions.push({
      key: 'share',
      icon: '↗️',
      label: '',
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    });
  }

  return actions;
};
