export * from './api/postApi'; // Выполняет запросы постов.

export * from './config/postTypes'; // Хранит типы постов.

export { getPostActions } from './lib/getPostActions'; // Возвращает действия поста.
export { normalizePosts } from './lib/normalizePosts'; // Приводит пост к формату карточки.

export * from './model/postSchema'; // Описывает схемы поста.

export { Post } from './ui/Post'; // Отображает карточку поста.
