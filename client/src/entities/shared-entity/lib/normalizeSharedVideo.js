/**
 * Нормализует объект видео для SharedEntityCard.
 */
export const normalizeSharedVideo = (video) => ({
  id: video.id,
  type: 'video',
  author: video.uploader || null,
  title: video.title || null,
  text: video.description || null,
  mediaUrl: video.videoUrl || null,
  date: (video.updatedAt ?? video.createdAt) || null,
  stats: {
    likesCount: video.likesCount ?? 0,
    viewsCount: video.viewsCount ?? 0,
    commentsCount: video.commentsCount ?? 0,
  },
});
