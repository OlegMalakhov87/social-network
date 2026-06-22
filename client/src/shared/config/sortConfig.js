/**
 * Варианты сортировки для выпадающего меню.
 * Поле `field` принимает одно из двух значений:
 *   `'date'`       – сортировка по дате,
 *   `'popularity'` – сортировка по популярности (просмотры/лайки/прослушивания).
 * Конкретное поле из данных определяется маппингом FIELD_MAP.
 */
export const SORT_OPTIONS = {
  dateDesc: { id: 'dateDesc', label: 'Сначала новые', field: 'date', order: 'desc' },
  dateAsc: { id: 'dateAsc', label: 'Сначала старые', field: 'date', order: 'asc' },
  viewsDesc: { id: 'viewsDesc', label: 'По популярности ↓', field: 'popularity', order: 'desc' },
  viewsAsc: { id: 'viewsAsc', label: 'По популярности ↑', field: 'popularity', order: 'asc' },
};

/**
 * Маппинг абстрактного поля “дата” и “популярность” на реальные поля объектов.
 * Для постов популярность = likesCount,
 * для музыки = playCount,
 * для видео и новостей = viewCount.
 */
export const FIELD_MAP = {
  Video: { views: 'viewCount', date: 'createdAt' },
  Music: { views: 'playCount', date: 'createdAt' },
  News: { views: 'viewCount', date: 'createdAt' },
  Post: { views: 'likesCount', date: 'createdAt' },
};
