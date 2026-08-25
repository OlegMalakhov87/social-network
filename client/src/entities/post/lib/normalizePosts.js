/**
 * Преобразует данные поста из API в формат компонента Post.
 */
export const normalizePosts = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    userId: raw.userId,
    text: raw.text,
    postUrl: raw.postUrl,
    isPublic: raw.isPublic,
    type: raw.type,
    pinned: raw.pinned,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    author: raw.author,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    comments: raw.comments ?? [],
    commentsCount: raw.commentsCount ?? 0,
  };
};
