/**
 * Нормализует объект видео в объект для отправки.
 *
 * @param {Object} video - объект видео.
 * @returns {Object} - объект нормализованного видео для отправки.
 */
export const normalizeSharedVideo = (video) => ({
  id: video.id,

  type: 'video',

  author: video.uploaderName || null,

  title: video.title || null,

  text: video.description || null,

  mediaUrl: video.videoUrl || null,

  date: video.date || null,

  stats: {
    likesCount: video.likesCount ?? 0,
    viewsCount: video.viewsCount ?? 0,
    commentsCount: video.commentsCount ?? 0,
  },
});
