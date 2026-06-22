//export { default as commentsReducer } from './model/commentsSlice';
//export * from './model/commentsSelectors';
export {
  addComment,
  updateNewCommentText,
  editComment,
  deleteComment,
} from './model/commentsSlice';
export { CommentsList } from './ui/CommentsList';
export { CommentCard } from './ui/CommentCard';
export { CommentForm } from './ui/CommentForm';
export { normalizeComment } from './lib/normalizeComment';
export { fetchComments, addCommentApi, editCommentApi, deleteCommentApi } from './api/commentApi';
