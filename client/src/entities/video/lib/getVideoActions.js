/**
 * Возвращает действия видео.
 *
 * @param {Object} params - Параметры действий
 * @param {Object} params.video - Видео
 * @param {boolean} params.isOwn - Признак владельца видео
 * @param {Function} [params.toggleLike] - Обработчик лайка
 * @param {Function} [params.toggleComments] - Обработчик комментариев
 * @param {Function} [params.addToLibrary] - Обработчик добавления в библиотеку
 * @param {Function} [params.deleteFromLibrary] - Обработчик удаления из библиотеки
 * @param {Function} [params.onUpdate] - Обработчик обновления
 * @param {boolean} params.disabledButton - Признак блокировки кнопки
 * @returns {Array<Object>} Действия видео
 */
export const getVideoActions = ({
  video,
  isOwn,
  toggleLike,
  toggleComments,
  addToLibrary,
  deleteFromLibrary,
  onUpdate,
  disabledButton,
}) => {
  if (!video) return [];

  const actions = [
    {
      key: 'like',
      icon: video.isLiked ? '❤️' : '🤍',
      label: String(video.likesCount ?? 0),
      ariaLabel: video.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(video.id, video.isLiked),
      disabled: disabledButton,
    },

    {
      key: 'comments',
      icon: '💬',
      label: String(video.commentsCount ?? 0),
      ariaLabel: 'Комментарии',
      onClick: () => toggleComments?.(video.id),
      disabled: disabledButton,
    },
  ];

  if (isOwn) {
    actions.push({
      key: 'update',
      icon: '✏️',
      label: '',
      ariaLabel: 'Обновить видео',
      onClick: () => onUpdate?.(video),
      disabled: disabledButton,
    });
  }

  if (video.isPublic !== false) {
    actions.push({
      key: 'library',
      icon: video.isInLibrary ? '📚' : '➕',
      label: video.isInLibrary ? '' : '',
      ariaLabel: 'Библиотека',
      onClick: () =>
        video.isInLibrary
          ? deleteFromLibrary?.(video.libraryId, video.id)
          : addToLibrary?.(video.id),
    });
  } else {
    actions.push({
      key: 'visible',
      icon: '🔒',
      label: '',
      ariaLabel: 'Личное',
      disabled: true,
    });
  }

  return actions;
};
