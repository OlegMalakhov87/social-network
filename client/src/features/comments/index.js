//export { useCommentsActions } from './model/useCommentsActions';

/**Хук для получения комментариев с бесконечным скроллом*/
export { useFetchComments } from './model/useFetchComments';

/** Хук для управления панелью комментариев (открытие/закрытие, скролл к секции комментариев при открытии панели)*/
export { useCommentsPanel } from './model/useCommentsPanel';

/** Компонент для формы комментария*/
export { CommentForm } from './ui/CommentForm';
