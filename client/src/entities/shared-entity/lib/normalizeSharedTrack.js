/**
 * Нормализует объект трека для SharedEntityCard.
 */
export const normalizeSharedTrack = (track) => ({
  id: track.id,
  type: 'track',
  author: track.uploader || null,
  title: track.title || null,
  text: track.description || null,
  mediaUrl: track.audioUrl || null,
  date: (track.updatedAt ?? track.createdAt) || null,
  stats: {
    likesCount: track.likesCount ?? 0,
    commentsCount: track.commentsCount ?? 0,
    playsCount: track.playsCount ?? track.playCount ?? 0,
  },
});
