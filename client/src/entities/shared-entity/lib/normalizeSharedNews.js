/**
 * Приводит новость к карточке общей сущности.
 *
 * @param {Object} news - Новость
 * @returns {Object} Карточка общей сущности
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
