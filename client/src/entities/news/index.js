export * from './api/newsApi'; // API для новостей.

export { getNewsActions } from './lib/getNewsActions'; // Функция для получения действий для новости.
export { normalizeNews } from './lib/normalizeNews'; // Функция для нормализации данных новости.

export * from './config/newsTypes'; // Массив типов новостей.
export * from './model/newsTabs'; // Мапа для выбора вкладки новостей и категории новости.

export { News } from './ui/News'; // Компонент для отображения карточки новости.
