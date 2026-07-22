/**
 * Варианты сортировки для выпадающего меню.
 * @returns {Object} - объект с вариантами сортировки
 */
export const SORT_OPTIONS = {
  /** Сортировка по дате по убыванию */
  dateDesc: {
    id: 'dateDesc',
    label: 'Сначала новые',
    field: 'date',
    order: 'desc',
  },
  /** Сортировка по дате по возрастанию */
  dateAsc: {
    id: 'dateAsc',
    label: 'Сначала старые',
    field: 'date',
    order: 'asc',
  },
  /** Сортировка по популярности по убыванию */
  viewsDesc: {
    id: 'viewsDesc',
    label: 'По популярности ↓',
    field: 'popularity',
    order: 'desc',
  },
  /** Сортировка по популярности по возрастанию */
  viewsAsc: {
    id: 'viewsAsc',
    label: 'По популярности ↑',
    field: 'popularity',
    order: 'asc',
  },
};

/**
 * Маппинг для полей сортировки.
 * @returns {Object} - объект с маппингами для полей сортировки
 */
export const FIELD_MAP = {
  /** Маппинг для видео */
  videos: { views: 'viewCount', date: 'createdAt' },
  /** Маппинг для музыки */
  tracks: { views: 'playCount', date: 'createdAt' },
  /** Маппинг для новостей */
  news: { views: 'viewCount', date: 'createdAt' },
  /** Маппинг для постов */
  posts: { views: 'likesCount', date: 'createdAt' },
  /** Маппинг для комментариев */
  comments: { views: 'likesCount', date: 'createdAt' },
};
