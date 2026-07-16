//export { default as postsReducer } from './model/postsSlice';
//export * from './model/postSelectors';
//export { addPost, deletePost, updateNewPostText, updateVisibilityPost } from './model/postsSlice';

// API - функции для страницы постов (CRUD)
export * from './api/postApi';

// Типы постов и типы приватности постов
export * from './config/postTypes';

// Вспомогптельные функции для постов (экшены)
export { getPostActions } from './lib/getPostActions';
// Функция нормализации поста
export { normalizePost } from './lib/normalizePost';

// Карточка поста
export { Post } from './ui/Post';
