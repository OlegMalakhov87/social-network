/**
 * Преобразует данные поста из API в формат компонента Post.
 */
export const normalizePosts = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    userId: raw.userId,
    type: raw.type,
    text: raw.text,
    postUrl: raw.postUrl,
    previewUrl: raw.previewUrl,
    thumbnailUrl: raw.thumbnailUrl,
    pinned: raw.pinned ?? false,
    isPublic: raw.isPublic ?? true,
    isEdited: raw.isEdited ?? false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    author: raw.author,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    comments: raw.comments ?? [],
    commentsCount: raw.commentsCount ?? 0,
  };
};
