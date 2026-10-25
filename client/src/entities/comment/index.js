export * from './api/commentApi'; // Выполняет запросы комментариев.

export { getCommentActions } from './lib/getCommentActions'; // Возвращает действия комментария.
export { normalizeComments } from './lib/normalizeComments'; // Приводит комментарий к формату карточки.

export * from './model/commentSchema'; // Описывает схемы комментария.

export { Comment } from './ui/Comment'; // Отображает карточку комментария.
