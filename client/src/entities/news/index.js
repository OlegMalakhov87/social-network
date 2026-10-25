export * from './api/newsApi'; // Выполняет запросы новостей.

export { getNewsActions } from './lib/getNewsActions'; // Возвращает действия новости.
export { normalizeNews } from './lib/normalizeNews'; // Приводит новость к формату карточки.

export { CATEGORY_OPTIONS, NEWS_TYPES } from './config/newsTypes'; // Хранит типы новостей и варианты категорий.

export * from './model/newsSchema'; // Описывает схемы новости.
export { CATEGORIES } from './model/newsTabs'; // Хранит категории новостей.

export { News } from './ui/News'; // Отображает карточку новости.
