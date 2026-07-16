//export { default as commentsReducer } from './model/commentsSlice';
//export * from './model/commentsSelectors';
/**export {
  addComment,
  updateNewCommentText,
  editComment,
  deleteComment,
} from './model/commentsSlice';**/

/**
 * Вспомогательные функции для комментариев.
 */
export { getCommentActions } from './lib/getCommentActions';
export { normalizeComment } from './lib/normalizeComment';
/**
 * Компоненты для комментариев.
 */
export { Comment } from './ui/Comment';
/**
 * API для комментариев.
 */
export {
  addCommentApi,
  deleteCommentApi,
  editCommentApi,
  fetchComments,
  fetchCommentById,
} from './api/commentApi';
