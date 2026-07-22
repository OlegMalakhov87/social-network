/**
 * Формирует массив действий карточки трека.
 *
 * @param {Object} params - параметры
 * @param {Object} params.track - данные трека
 * @param {boolean} params.isOwn - флаг владельца трека
 * @param {Function} params.toggleLike - функция для лайка/дизлайка трека
 * @param {Function} params.toggleComments - функция для открытия/закрытия комментариев к треку
 * @param {Function} params.addToLibrary - функция для добавления трека в библиотеку
 * @param {Function} params.removeFromLibrary - функция для удаления трека из библиотеки
 * @param {Function} params.onUpdate - функция для обновления трека
 * @returns {Array<Object>} - массив действий для карточки трека
 */
export const getTrackActions = ({
  track,
  isOwn,
  toggleLike,
  toggleComments,
  addToLibrary,
  removeFromLibrary,
  onUpdate,
}) => {
  if (!track) return [];

  const actions = [
    {
      key: 'like',
      icon: track.isLiked ? '❤️' : '🤍',
      label: String(track.likesCount ?? 0),
      ariaLabel: track.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(track.id, track.isLiked),
    },

    {
      key: 'comments',
      icon: '💬',
      label: String(track.commentsCount ?? 0),
      ariaLabel: 'Комментарии',
      onClick: () => toggleComments?.(track.id),
    },
  ];

  if (isOwn) {
    actions.push({
      key: 'update',
      icon: '✏️',
      label: 'Обновить',
      ariaLabel: 'Обновить трек',
      onClick: () => onUpdate?.(track),
    });
  }

  if (track.isPublic !== false && isOwn) {
    actions.push({
      key: 'library',
      icon: track.isInLibrary ? '📚' : '➕',
      label: track.isInLibrary ? 'В библиотеке' : 'В библиотеку',
      ariaLabel: 'Библиотека',

      onClick: () =>
        track.isInLibrary
          ? removeFromLibrary?.(track.libraryId, track.id)
          : addToLibrary?.(track.id),
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
