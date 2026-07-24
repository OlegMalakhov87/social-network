/**
 * Нормализует объект новости в объект SharedEntityCard.
 *
 * @param {Object} news - объект новости.
 * @returns {Object} - объект нормализованного новости.
 */
export const normalizeSharedNews = (news) => ({
  id: news.id,

  type: 'news',

  author: news.author || null,

  title: news.title || null,

  text: news.content || null,

  mediaUrl: news.mediaUrl || null,

  mediaType: news.type || null,

  date: news.date || null,

  stats: {
    likesCount: news.likesCount ?? 0,
    viewsCount: news.viewsCount ?? 0,
    commentsCount: news.commentsCount ?? 0,
  },
});
