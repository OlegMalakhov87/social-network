/**
 * Приводит новость с сервера к формату карточки.
 *
 * @param {Object} raw - Новость с сервера
 * @returns {Object} Новость карточки
 */
export const normalizeNews = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    uploadedBy: raw.uploadedBy,
    title: raw.title,
    text: raw.text,
    category: raw.category,
    type: raw.type,
    source: raw.source,
    newsUrl: raw.newsUrl,
    previewUrl: raw.previewUrl,
    thumbnailUrl: raw.thumbnailUrl,
    viewsCount: raw.viewsCount ?? 0,
    isEdited: raw.isEdited ?? false,
    publishedAt: raw.publishedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    uploader: raw.uploader,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    comments: raw.comments ?? [],
    commentsCount: raw.commentsCount ?? 0,
  };
};
