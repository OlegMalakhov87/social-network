import { Comment } from '../../../entities/comment';
import { CommentForm } from '../../../features/comments';
import { useInfiniteScroll } from '../../../shared/hook';
import { ContentState, Loading } from '../../../shared/ui';
import style from './CommentsList.module.css';

/**
 * Список комментариев. Содержит в себе список комментариев и форму для добавления нового комментария.
 *
 * @param {Object} props
 * @param {Object} props.comments - Список комментариев.
 * @param {Object} props.isLoading - Флаг загрузки.
 * @param {Object} props.hasMore - Флаг наличия ещё комментариев.
 * @param {Object} props.currentUser - Текущий пользователь.
 * @param {Function} props.onCloseComments - Функция для закрытия комментариев.
 * @param {Function} props.onCommentSubmit - Функция для добавления нового комментария.
 * @param {Function} props.onEditComment - Функция для редактирования комментария.
 * @param {Function} props.onDeleteComment - Функция для удаления комментария.
 * @param {Function} props.toggleLikeComment - Функция для лайка комментария.
 * @param {Function} props.loadMore - Функция для загрузки ещё комментариев.
 * @param {Object} props.error - Ошибка.
 * @param {Function} props.onRetry - Функция для повторной загрузки комментариев.
 */
export const CommentsList = ({
  comments = [],
  isLoading,
  hasMore,
  currentUser,
  onCloseComments,
  loadMore,
  error,
  onRetry,
  onCommentSubmit,
  onEditComment,
  onDeleteComment,
  toggleLikeComment,
}) => {
  const lastElementRef = useInfiniteScroll(loadMore, hasMore, isLoading);

  return (
    <ContentState
      loading={isLoading}
      error={error}
      isEmpty={!comments?.length}
      loadingMessage="Загружаем комментарии..."
      emptyIcon="💬"
      emptyTitle="Комментариев пока нет"
      emptyDescription="Будьте первым!"
      onRetry={onRetry}
    >
      <div className={style.list}>
        {comments.map((item, index) => {
          const isLast = index === comments.length - 1;

          return (
            <div
              key={item.comment.id}
              ref={isLast ? lastElementRef : undefined}
            >
              <Comment
                comment={item.comment}
                author={item.author}
                currentUserId={currentUser?.id}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                toggleLike={toggleLikeComment}
              />
            </div>
          );
        })}

        {isLoading && <Loading size="small" message="Загружаем ещё..." />}
      </div>

      <CommentForm
        currentUser={currentUser}
        onClose={onCloseComments}
        onSubmit={onCommentSubmit}
      />
    </ContentState>
  );
};
