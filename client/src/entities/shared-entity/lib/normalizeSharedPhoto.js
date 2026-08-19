/**
 * Нормализует пост-фото для SharedEntityCard.
 */
export const normalizeSharedPhoto = (photo) => ({
  id: photo.id,
  type: 'photo',
  author: photo.author || null,
  mediaUrl: photo.media ?? photo.mediaUrl ?? null,
  title: photo.title || null,
  date: photo.date ?? photo.updatedAt ?? photo.createdAt ?? null,
  stats: {
    likesCount: photo.likesCount ?? 0,
    commentsCount: photo.commentsCount ?? 0,
  },
});
