import { Comment } from '../../../entities/comment';
import { CommentForm } from '../../../features/comments';
import {
  ContentState,
  ErrorBanner,
  InfiniteScrollFooter,
} from '../../../shared/ui';
import style from './CommentsList.module.css';

/**
 * Список комментариев. Содержит в себе список комментариев и форму для добавления нового комментария.
 *
 * @param {Object} props
 * @param {Object} props.comments - Список комментариев.
 * @param {Object} props.isLoading - Флаг загрузки.
 * @param {Object} props.isLoadingMore - Флаг загрузки ещё комментариев.
 * @param {Object} props.hasMore - Флаг наличия ещё комментариев.
 * @param {Object} props.error - Ошибка.
 * @param {Object} props.currentUser - Текущий пользователь.
 * @param {Function} props.loadMore - Функция для загрузки ещё комментариев.
 * @param {Function} props.onCommentSubmit - Функция для добавления нового комментария.
 * @param {Function} props.onEditComment - Функция для редактирования комментария.
 * @param {Function} props.onDeleteComment - Функция для удаления комментария.
 * @param {Function} props.toggleLikeComment - Функция для лайка комментария.
 * @param {Function} props.onCloseComments - Функция для закрытия комментариев.
 * @param {Function} props.onRetry - Функция для повторной загрузки комментариев.
 */
export const CommentsList = ({
  comments = [],
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  currentUser,
  loadMore,
  onCommentSubmit,
  onEditComment,
  onDeleteComment,
  toggleLikeComment,
  onCloseComments,
  onRetry,
}) => {
  return (
    <ContentState
      loading={isLoading && comments.length === 0}
      error={error && comments.length === 0}
      isEmpty={!comments?.length}
      loadingMessage="Загружаем комментарии..."
      emptyIcon="💬"
      emptyTitle="Комментариев пока нет"
      emptyDescription="Будьте первым!"
      onRetry={onRetry}
    >
      <div className={style.list}>
        {comments.map((item) => {
          return (
            <Comment
              key={item.comment.id}
              comment={item.comment}
              author={item.author}
              currentUserId={currentUser?.id}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              toggleLike={toggleLikeComment}
            />
          );
        })}

        {comments.length > 0 && (
          <InfiniteScrollFooter
            hasMore={hasMore}
            isLoading={isLoadingMore}
            error={error}
            onRetry={loadMore}
            endMessage="Вы просмотрели все комментарии"
          />
        )}

        {error && comments.length > 0 && (
          <ErrorBanner
            message="Не удалось загрузить следующую порцию комментариев"
            onRetry={loadMore}
          />
        )}
      </div>

      <CommentForm
        currentUser={currentUser}
        onClose={onCloseComments}
        onSubmit={onCommentSubmit}
      />
    </ContentState>
  );
};
