/**
 * Формирует массив действий карточки трека.
 *
 * @param {Object} params
 * @param {Object} params.track
 * @param {boolean} params.isOwn
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike
 * @param {(id:number)=>void} params.toggleComments
 * @param {(id:number)=>void} params.addToLibrary
 * @param {(id:number,libraryId:number)=>void} params.removeFromLibrary
 * @param {Function} params.onShare
 *
 * @returns {Array}
 */

export const getTrackActions = ({
  track,
  isOwn,
  toggleLike,
  toggleComments,
  addToLibrary,
  removeFromLibrary,
  onShare,
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

    actions.push({
      key: 'share',
      icon: '↗️',
      label: String(track.sharedCount ?? 0),
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    });
  } else {
    actions.push({
      key: 'visible',
      icon: '🔒',
      label: 'Личное',
      ariaLabel: 'Личное',
    });
  }

  return actions;
};
