/**
 * Формирует массив действий карточки трека.
 *
 * @param {Object} params
 * @param {Object} params.track - трек
 * @param {boolean} params.isOwn - флаг владельца трека
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike - функция для лайка/дизлайка трека
 * @param {(id:number)=>void} params.toggleComments - функция для открытия/закрытия комментариев к треку
 * @param {(id:number)=>void} params.addToLibrary - функция для добавления трека в библиотеку
 * @param {(id:number,libraryId:number)=>void} params.removeFromLibrary - функция для удаления трека из библиотеки
 *
 * @returns {Array<Object>} - массив действий карточки трека
 */

export const getTrackActions = ({
  track,
  isOwn,
  toggleLike,
  toggleComments,
  addToLibrary,
  removeFromLibrary,
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
