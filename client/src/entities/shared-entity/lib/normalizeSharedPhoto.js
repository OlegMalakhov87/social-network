/**
 * Нормализует пост-фото для SharedEntityCard.
 */
export const normalizeSharedPhoto = (photo) => ({
  id: photo.id,
  type: 'photo',
  author: photo.author || null,
  mediaUrl: photo.postUrl || null,
  title: photo.title || null,
  date: (photo.updatedAt ?? photo.createdAt) || null,
  stats: {
    likesCount: photo.likesCount ?? 0,
    commentsCount: photo.commentsCount ?? 0,
  },
});
