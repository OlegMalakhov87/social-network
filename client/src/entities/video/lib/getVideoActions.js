/**
 * Формирует массив действий карточки видео.
 *
 * @param {Object} params
 * @param {Object} params.video
 * @param {boolean} params.isOwn
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike
 * @param {(id:number)=>void} params.toggleComments
 * @param {(id:number)=>void} params.addToLibrary
 * @param {(id:number,libraryId:number)=>void} params.removeFromLibrary
 * @param {Function} params.onShare
 *
 * @returns {Array<Object>}
 */

export const getVideoActions = ({
  video,
  isOwn,
  toggleLike,
  toggleComments,
  addToLibrary,
  removeFromLibrary,
  onShare,
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

    actions.push({
      key: 'share',
      icon: '↗️',
      label: String(video.sharedCount ?? 0),
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
