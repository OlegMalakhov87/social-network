/**
 * Нормализует объект новости для SharedEntityCard.
 */
export const normalizeSharedNews = (news) => ({
  id: news.id,
  type: 'news',
  author: news.author || news.uploader?.name || null,
  title: news.title || null,
  text: news.text ?? news.content ?? null,
  mediaUrl: news.media ?? news.mediaUrl ?? null,
  mediaType: news.type || null,
  date: news.date ?? news.updatedAt ?? news.createdAt ?? null,
  stats: {
    likesCount: news.likesCount ?? 0,
    viewsCount: news.viewsCount ?? 0,
    commentsCount: news.commentsCount ?? 0,
  },
});
