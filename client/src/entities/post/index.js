export * from './api/postApi'; // API для постов

export * from './config/postTypes'; // Конфигурация типов постов

export { getPostActions } from './lib/getPostActions'; // Функция для получения действий для поста
export { normalizePost } from './lib/normalizePost'; // Функция для нормализации поста

export { Post } from './ui/Post'; // Компонент для отображения карточки поста
