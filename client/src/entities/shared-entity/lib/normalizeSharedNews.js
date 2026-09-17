/**
 * Нормализует объект новости для SharedEntityCard.
 */
export const normalizeSharedNews = (news) => ({
  id: news.id,
  type: 'news',
  author: news.uploader || null,
  title: news.title || null,
  text: news.text || null,
  mediaUrl: news.newsUrl || null,
  date: (news.updatedAt ?? news.createdAt) || null,
  stats: {
    likesCount: news.likesCount ?? 0,
    viewsCount: news.viewsCount ?? 0,
    commentsCount: news.commentsCount ?? 0,
  },
});
