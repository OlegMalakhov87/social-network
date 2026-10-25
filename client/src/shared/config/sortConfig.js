/**
 * Содержит варианты сортировки для списка.
 */
export const SORT_OPTIONS = {
  /** Сортирует по дате по убыванию. */
  dateDesc: {
    id: 'dateDesc',
    label: 'Сначала новые',
    field: 'date',
    order: 'desc',
  },
  /** Сортирует по дате по возрастанию. */
  dateAsc: {
    id: 'dateAsc',
    label: 'Сначала старые',
    field: 'date',
    order: 'asc',
  },
  /** Сортирует по популярности по убыванию. */
  viewsDesc: {
    id: 'viewsDesc',
    label: 'По популярности ↓',
    field: 'popularity',
    order: 'desc',
  },
  /** Сортирует по популярности по возрастанию. */
  viewsAsc: {
    id: 'viewsAsc',
    label: 'По популярности ↑',
    field: 'popularity',
    order: 'asc',
  },
};

/**
 * Сопоставляет тип сущности с полями сортировки.
 */
export const FIELD_MAP = {
  /** Сопоставляет поля видео. */
  videos: { views: 'viewsCount', date: 'createdAt' },
  /** Сопоставляет поля музыки. */
  tracks: { views: 'playCount', date: 'createdAt' },
  /** Сопоставляет поля новостей. */
  news: { views: 'viewsCount', date: 'createdAt' },
  /** Сопоставляет поля постов. */
  posts: { views: 'likesCount', date: 'createdAt' },
  /** Сопоставляет поля комментариев. */
  comments: { views: 'likesCount', date: 'createdAt' },
};
