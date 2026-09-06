/**
 * Формирует массив действий карточки видео.
 *
 * @param {Object} params - пропсы компонента
 * @param {Object} params.video - данные видео
 * @param {boolean} params.isOwn - флаг владельца видео
 * @param {Function} params.toggleLike - функция для лайка/дизлайка видео
 * @param {Function} params.toggleComments - функция для открытия/закрытия комментариев к видео
 * @param {Function} params.addToLibrary - функция для добавления видео в библиотеку
 * @param {Function} params.deleteFromLibrary - функция для удаления видео из библиотеки
 * @param {Function} params.onUpdate - функция для обновления видео
 * @param {boolean} params.disabledButton - флаг для блокировки кнопки
 * @returns {Array<Object>} - массив действий карточки видео
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
