/**
 * Формирует массив действий карточки видео.
 *
 * @param {Object} params
 * @param {Object} params.video - видео
 * @param {boolean} params.isOwn - флаг владельца видео
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike - функция для лайка/дизлайка видео
 * @param {(id:number)=>void} params.toggleComments - функция для открытия/закрытия комментариев к видео
 * @param {(id:number)=>void} params.addToLibrary - функция для добавления видео в библиотеку
 * @param {(id:number,libraryId:number)=>void} params.removeFromLibrary - функция для удаления видео из библиотеки
 * @param {Function} params.onUpdate - функция для обновления видео
 * @returns {Array<Object>} - массив действий карточки видео
 */
export const getVideoActions = ({
  video,
  isOwn,
  toggleLike,
  toggleComments,
  addToLibrary,
  removeFromLibrary,
  onUpdate,
}) => {
  if (!video) return [];

  const actions = [
    {
      key: 'like',
      icon: video.isLiked ? '❤️' : '🤍',
      label: String(video.likesCount ?? 0),
      ariaLabel: video.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(video.id, video.isLiked),
    },

    {
      key: 'comments',
      icon: '💬',
      label: String(video.commentsCount ?? 0),
      ariaLabel: 'Комментарии',
      onClick: () => toggleComments?.(video.id),
    },
  ];

  if (isOwn) {
    actions.push({
      key: 'update',
      icon: '✏️',
      label: 'Обновить',
      ariaLabel: 'Обновить видео',
      onClick: () => onUpdate?.(video),
    });
  }

  if (video.isPublic !== false && isOwn) {
    actions.push({
      key: 'library',
      icon: video.isInLibrary ? '📚' : '➕',
      label: video.isInLibrary ? 'В библиотеке' : 'В библиотеку',
      ariaLabel: 'Библиотека',
      onClick: () =>
        video.isInLibrary
          ? removeFromLibrary?.(video.libraryId, video.id)
          : addToLibrary?.(video.id),
    });
  } else {
    actions.push({
      key: 'visible',
      icon: '🔒',
      label: 'Личное',
      ariaLabel: 'Личное',
      disabled: true,
    });
  }

  return actions;
};
