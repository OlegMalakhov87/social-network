/**
 * Возвращает действия трека.
 *
 * @param {Object} params - Параметры действий
 * @param {Object} params.track - Трек
 * @param {boolean} params.isOwn - Признак владельца трека
 * @param {Function} [params.toggleLike] - Обработчик лайка
 * @param {Function} [params.toggleComments] - Обработчик комментариев
 * @param {Function} [params.addToLibrary] - Обработчик добавления в библиотеку
 * @param {Function} [params.deleteFromLibrary] - Обработчик удаления из библиотеки
 * @param {Function} [params.onUpdate] - Обработчик обновления
 * @param {boolean} params.disabledButton - Признак блокировки кнопки
 * @returns {Array<Object>} Действия трека
 */
export const getTrackActions = ({
  track,
  isOwn,
  toggleLike,
  toggleComments,
  addToLibrary,
  deleteFromLibrary,
  onUpdate,
  disabledButton,
}) => {
  if (!track) return [];

  const actions = [
    {
      key: 'like',
      icon: track.isLiked ? '❤️' : '🤍',
      label: String(track.likesCount ?? 0),
      ariaLabel: track.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(track.id, track.isLiked),
      disabled: disabledButton,
    },

    {
      key: 'comments',
      icon: '💬',
      label: String(track.commentsCount ?? 0),
      ariaLabel: 'Комментарии',
      onClick: () => toggleComments?.(track.id),
      disabled: disabledButton,
    },
  ];

  if (isOwn) {
    actions.push({
      key: 'update',
      icon: '✏️',
      label: '',
      ariaLabel: 'Обновить трек',
      onClick: () => onUpdate?.(track),
      disabled: disabledButton,
    });
  }

  if (track.isPublic !== false) {
    actions.push({
      key: 'library',
      icon: track.isInLibrary ? '📚' : '➕',
      label: track.isInLibrary ? '' : '',
      ariaLabel: 'Библиотека',

      onClick: () =>
        track.isInLibrary
          ? deleteFromLibrary?.(track.libraryId, track.id)
          : addToLibrary?.(track.id),
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
