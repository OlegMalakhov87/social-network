/**
 * Нормализует объект трека для SharedEntityCard.
 */
export const normalizeSharedTrack = (track) => ({
  id: track.id,
  type: 'track',
  author: track.artist || track.uploader?.name || null,
  title: track.title || null,
  text: track.description || null,
  mediaUrl: track.audio ?? track.fileUrl ?? null,
  mediaType: 'audio',
  date: track.date ?? track.updatedAt ?? track.createdAt ?? null,
  stats: {
    likesCount: track.likesCount ?? 0,
    commentsCount: track.commentsCount ?? 0,
    playsCount: track.playsCount ?? track.playCount ?? 0,
  },
});
