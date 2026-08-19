/**
 * Нормализует объект видео для SharedEntityCard.
 */
export const normalizeSharedVideo = (video) => ({
  id: video.id,
  type: 'video',
  author: video.uploader?.name ?? video.uploaderName ?? null,
  title: video.title || null,
  text: video.description || null,
  mediaUrl: video.url ?? video.videoUrl ?? null,
  mediaType: 'video',
  date: video.date ?? video.updatedAt ?? video.createdAt ?? null,
  stats: {
    likesCount: video.likesCount ?? 0,
    viewsCount: video.viewsCount ?? 0,
    commentsCount: video.commentsCount ?? 0,
  },
});
