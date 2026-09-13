export * from './api/newsApi'; // API для новостей.

export { getNewsActions } from './lib/getNewsActions'; // Функция для получения действий для новости.
export { normalizeNews } from './lib/normalizeNews'; // Функция для нормализации данных новости.

export { CATEGORY_OPTIONS, NEWS_TYPES } from './config/newsTypes'; // Мапа для выбора категории новости и массив типов новостей.
export { CATEGORIES } from './model/newsTabs'; // Мапа для выбора категории новостей.

export { News } from './ui/News'; // Компонент для отображения карточки новости.
