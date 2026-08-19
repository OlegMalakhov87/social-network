/**
 * Преобразует новость News с сервера в формат компонента News.
 *
 * Сервер: text, media, author (string), uploader, type, date, viewsCount
 */
export const normalizeNews = (raw, currentUserId) => {
  if (!raw || typeof raw !== 'object') return raw;

  const mediaUrl = raw.media ?? raw.mediaUrl ?? null;

  return {
    id: raw.id,
    uploadedBy: raw.uploadedBy,
    title: raw.title,
    text: raw.text,
    content: raw.text ?? raw.content ?? '',
    date: raw.date,
    author: raw.author,
    uploader: raw.uploader,
    category: raw.category,
    type: raw.type,
    source: raw.source,
    media: raw.media,
    mediaUrl,
    viewsCount: raw.viewsCount ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    likesCount: raw.likesCount ?? raw.likes?.length ?? 0,
    isLiked: raw.likes?.some((like) => like.userId === currentUserId) ?? false,

    comments: raw.comments || [],
    commentsCount: raw.commentsCount ?? raw.comments?.length ?? 0,
  };
};
