/**
 * Нормализует объект трека в объект SharedEntityCard.
 *
 * @param {Object} track - объект трека.
 * @returns {Object} - объект нормализованного трека.
 */
export const normalizeSharedTrack = (track) => ({
  id: track.id,

  type: 'track',

  author: track.artist||null,

  title: track.title||null,

  text: track.description||null,

  mediaUrl: track.fileUrl||null,

  stats: {
    likesCount: track.likesCount ?? 0,
    commentsCount: track.commentsCount ?? 0,
    playsCount: track.playsCount ?? 0,
  },
});
