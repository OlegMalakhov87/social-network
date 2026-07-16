//export { default as newsReducer } from './model/newsSlice';
//export * from './model/newsSelectors';
//export { addNews, deleteNews } from './model/newsSlice';

/**
 * Экспортируем компоненты, библиотеки и API для работы с новостями.
 */
export * from './api/newsApi'; // API для работы с новостями.
export { getNewsActions } from './lib/getNewsActions'; // Получение действий для новости.
export { normalizeNews } from './lib/normalizeNews'; // Нормализация данных новостей.
export * from './model/newsTabs'; // Мапа для выбора вкладки новостей и категории новости.
export { News } from './ui/News'; // Карточка новости.
