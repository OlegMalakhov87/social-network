//export { default as postsReducer } from './model/postsSlice';
//export * from './model/postSelectors';
//export { addPost, deletePost, updateNewPostText, updateVisibilityPost } from './model/postsSlice';

// API - функции
export * from './api/postApi';
/** Типы постов */
export * from './config/postTypes';
// Вспомогптельные функции
export { getPostActions } from './lib/getPostActions';
export { normalizePost } from './lib/normalizePost';
//Ui компоненты
export { Post } from './ui/Post';
