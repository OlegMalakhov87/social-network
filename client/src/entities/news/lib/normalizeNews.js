/**
 * Преобразует новость News с сервера в формат компонента News.
 */
export const normalizeNews = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    uploadedBy: raw.uploadedBy,
    title: raw.title,
    text: raw.text,
    newsUrl: raw.newsUrl,
    date: raw.date,
    uploader: raw.uploader,
    category: raw.category,
    type: raw.type,
    source: raw.source,
    viewsCount: raw.viewsCount,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    comments: raw.comments || [],
    commentsCount: raw.commentsCount ?? 0,
  };
};
