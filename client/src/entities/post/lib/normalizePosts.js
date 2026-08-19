/**
 * Преобразует данные поста из API в формат компонента Post.
 */
export const normalizePosts = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    userId: raw.userId,
    text: raw.text,
    media: raw.media,
    isPublic: raw.isPublic,
    type: raw.type,
    pinned: raw.pinned,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    date: raw.updatedAt ?? raw.createdAt,

    author: raw.author,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    comments: raw.comments ?? [],
    commentsCount: raw.commentsCount ?? 0,
  };
};
